const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary yapılandırması
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage yapılandırması
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'todo-app', // Cloudinary'de dosyaların yükleneceği klasör
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'], // İzin verilen dosya formatları
        transformation: [{ width: 500, height: 500, crop: 'limit' }] // Dosya boyutu sınırlaması
    }
});

// Multer upload middleware'i
const upload = multer({ storage: storage });

module.exports = {
    cloudinary,
    upload
}; 