// In propertyRoutes.js
const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController.js');
const upload = require('../middleware/fileUpload');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');

// Apply protect middleware to specific routes instead of router.use
router.get('/', protect, propertyController.getAllProperties);
router.post('/', protect, upload, propertyController.createProperty);

// في ملف routes
router.put('/:id', protect, (req, res, next) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ 
        success: false, 
        message: 'File upload error: ' + err.message 
      });
    } else if (err) {
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    }
    next();
  });
}, propertyController.updateProperty);router.delete('/:id', protect, propertyController.deleteProperty); // Add this line

module.exports = router;