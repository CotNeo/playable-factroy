const { cloudinary } = require('../config/cloudinary');

class FileService {
    // Dosya yükleme
    static async uploadFile(file) {
        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'todo-app',
                resource_type: 'auto'
            });
            return result.secure_url;
        } catch (error) {
            throw new Error('Dosya yükleme hatası: ' + error.message);
        }
    }

    // Dosya silme
    static async deleteFile(publicId) {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            throw new Error('Dosya silme hatası: ' + error.message);
        }
    }

    // Dosya URL'inden public ID çıkarma
    static getPublicIdFromUrl(url) {
        const matches = url.match(/\/v\d+\/([^/]+)\.\w+$/);
        return matches ? matches[1] : null;
    }
}

module.exports = FileService; 