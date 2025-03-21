require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Admin user credentials
const adminUser = {
  username: 'admin',
  email: 'admin@admin.com',
  password: 'admin123*'
};

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function createAdminUser() {
  try {
    // Check if admin already exists
    const userExists = await User.findOne({ 
      $or: [{ email: adminUser.email }, { username: adminUser.username }] 
    });

    if (userExists) {
      console.log('Admin user already exists. Updating password...');
      userExists.password = adminUser.password;
      await userExists.save();
      console.log('Admin user password updated successfully:');
      console.log(`- Username: ${userExists.username}`);
      console.log(`- Email: ${userExists.email}`);
      console.log(`- Password: ${adminUser.password}`);
      console.log('Use these credentials to log in to the application.');
      await mongoose.disconnect();
      return;
    }

    // Create new admin user
    const user = await User.create(adminUser);
    
    console.log('Admin user created successfully:');
    console.log(`- Username: ${user.username}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Password: ${adminUser.password}`);
    console.log('Use these credentials to log in to the application.');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

createAdminUser(); 