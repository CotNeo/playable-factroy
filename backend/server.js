/**
 * MERN To-Do Uygulaması (AI Destekli) - Backend Server
 * 
 * Bu proje Playable Factory şirketi Software Engineer Pozisyonu için
 * Furkan Akar (CotNeo) tarafından hazırlanmıştır.
 * GitHub: https://github.com/CotNeo
 * Web: https://cotneo.com
 * 
 * Bu proje GitHub Copilot desteğiyle Visual Studio Code ortamında geliştirilmiştir.
 * Referans Repolar:
 * - https://github.com/CotNeo/mern-crud
 * - https://github.com/iam-veeramalla/MERN-docker-compose/tree/compose/mern
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File System operations - only in development or non-Vercel environment
if (!isVercel) {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
  } else {
    console.log('Uploads directory exists:', uploadsDir);
  }

  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));
} else {
  // In Vercel, we need to handle file uploads differently
  // This is a placeholder for where you'd implement a cloud storage solution
  console.log('Running on Vercel - file uploads will not use local storage');
}

// Define API routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    environment: process.env.NODE_ENV || 'development',
    isVercel: isVercel ? 'Yes' : 'No',
    timestamp: new Date().toISOString()
  });
});

// Serve static assets in production but not on Vercel
// On Vercel, frontend will be a separate deployment
if (isProduction && !isVercel) {
  // Serve frontend build files
  const staticDir = path.join(__dirname, '../frontend/build');
  
  if (fs.existsSync(staticDir)) {
    console.log('Serving static frontend files from:', staticDir);
    app.use(express.static(staticDir));
    
    // For any other routes, serve the React app
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
        res.sendFile(path.join(staticDir, 'index.html'));
      }
    });
  } else {
    console.warn('Production build folder not found:', staticDir);
    console.warn('Please run "cd frontend && npm run build" first');
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Start server for local development
// In Vercel, this is not needed as Vercel handles the server
if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

// For Vercel, we need to export the Express app
module.exports = app; 