const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const FileService = require('../services/fileService');

// Tek dosya yükleme
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Dosya yüklenmedi' });
        }

        const fileUrl = await FileService.uploadFile(req.file);
        res.json({ url: fileUrl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Çoklu dosya yükleme
router.post('/upload-multiple', upload.array('files', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Dosya yüklenmedi' });
        }

        const fileUrls = await Promise.all(
            req.files.map(file => FileService.uploadFile(file))
        );

        res.json({ urls: fileUrls });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Dosya silme
router.delete('/delete', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ message: 'URL gerekli' });
        }

        const publicId = FileService.getPublicIdFromUrl(url);
        if (!publicId) {
            return res.status(400).json({ message: 'Geçersiz dosya URL\'i' });
        }

        await FileService.deleteFile(publicId);
        res.json({ message: 'Dosya başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 