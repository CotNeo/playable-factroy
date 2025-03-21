const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists with proper permissions
const uploadDir = path.join(__dirname, '../uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    console.log('Creating uploads directory:', uploadDir);
    fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
  } else {
    // Ensure the directory has proper permissions
    fs.chmodSync(uploadDir, 0o755);
    console.log('Uploads directory exists:', uploadDir);
  }
} catch (err) {
  console.error('Error ensuring uploads directory:', err);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Double-check directory exists before saving
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    let fileExt = path.extname(file.originalname).toLowerCase();
    
    // Default to .png if no extension
    if (!fileExt) {
      fileExt = '.png';
    }
    
    const filename = `${uniqueSuffix}${fileExt}`;
    console.log('Uploading file:', filename);
    cb(null, filename);
  }
});

// Filter for image file types
const imageFilter = (req, file, cb) => {
  // Accept only image files
  const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: imageFilter
});

// Error handler for multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

module.exports = { upload, handleMulterError }; 