const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload stream buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folder = 'profiles', isPrivate = false) => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_API_KEY) {
      // Fallback base64 data URI if credentials missing
      const base64Data = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
      return resolve({
        secure_url: base64Data,
        public_id: `dev_${Date.now()}`
      });
    }

    const uploadOptions = {
      folder: `shreedev_saas/${folder}`,
      resource_type: 'auto',
    };

    // Sensitive documents (Aadhaar cards) are uploaded with authenticated type
    if (isPrivate) {
      uploadOptions.type = 'authenticated';
    }

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (result) {
        resolve(result);
      } else {
        console.error('Cloudinary upload error:', error);
        reject(error);
      }
    });

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary
};
