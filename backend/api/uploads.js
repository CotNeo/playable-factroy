// This is a placeholder API route for handling file uploads on Vercel
// In a real implementation, you would use cloud storage like S3, Firebase Storage, etc.

module.exports = (req, res) => {
  res.status(501).json({
    error: 'File uploads are not supported in this serverless deployment',
    message: 'Please use a cloud storage solution like AWS S3, Firebase Storage, or Cloudinary',
    suggestion: 'Update the frontend to use direct-to-cloud uploads instead of server-based uploads'
  });
}; 