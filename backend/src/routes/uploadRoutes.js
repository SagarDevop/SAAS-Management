const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToCloudinary } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.use(protect);

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const docType = req.body.docType || 'profiles';
    const isPrivate = docType.includes('aadhaar');

    const result = await uploadToCloudinary(req.file.buffer, docType, isPrivate);

    res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'Image upload failed' });
  }
});

module.exports = router;

