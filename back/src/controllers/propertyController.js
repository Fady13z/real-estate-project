const Property = require("../models/PropertiesModel.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Enhanced Multer configuration for expert file handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/properties/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `contract-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only the following filetypes are allowed: ' + filetypes.join(', ')));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
}).single("ContractImage");

// Expert property creation with enhanced validation
async function createProperty(req, res) {
  try {
    const {
      unitType,
      area,
      price,
      phoneNumber,
      address,
      anotherInfo,
      features,
      status,
    } = req.body;

    // Advanced validation
    if (!unitType || !area || !price  || !phoneNumber || !address) {
      return res.status(400).json({
        success: false,
        message: "الرجاء إدخال جميع الحقول المطلوبة"
      });
    }

    // Parse features
    const featuresArray = typeof features === 'string' 
      ? features.split(',').map(item => item.trim()).filter(item => item)
      : features || [];

    const propertyData = {
      unitType,
      area: Number(area),
      price: Number(price),
      phoneNumber,
      address,
      anotherInfo,
      features: featuresArray,
      status: status || "متوفر",
    };

    if (req.file) {
      propertyData.ContractImage = `/uploads/properties/${req.file.filename}`;
    }

    const newProperty = await Property.create(propertyData);
    
    res.status(201).json({
      success: true,
      message: "تم إنشاء العقار بنجاح",
      data: newProperty
    });
  } catch (error) {
    console.error("Error creating property:", error);
    
    let errorMessage = "فشل في إنشاء العقار";
    if (error.name === 'ValidationError') {
      errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
    }

    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
}

// Expert property retrieval with advanced filtering
async function getAllProperties(req, res) {
  try {
    const { address, unitType, status } = req.query;
    let query = {};

    // Build query dynamically
    if (address) {
      query.address = { $regex: new RegExp(address, 'i') };
    }
    if (unitType) {
      query.unitType = unitType;
    }
    if (status) {
      query.status = status;
    }



    // Sorting and pagination
    const sortBy = req.query.sort || '-createdAt';
    const limit = Number(req.query.limit) || 20;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const properties = await Property.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const total = await Property.countDocuments(query);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: properties
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في جلب العقارات'
    });
  }
}

// Expert property update with comprehensive error handling
async function updateProperty(req, res) {
  try {
    const { id } = req.params;
    const existingProperty = await Property.findById(id);
    
    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message: "العقار غير موجود"
      });
    }

    const updateData = {
      unitType: req.body.unitType,
      area: Number(req.body.area),
      price: Number(req.body.price),
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      anotherInfo: req.body.anotherInfo || '',
      features: Array.isArray(req.body.features) ? 
               req.body.features : 
               req.body.features.split(',').map(item => item.trim()),
      status: req.body.status
    };

    // Handle contract file
    if (req.file) {
      // Delete old file if exists
      if (existingProperty.ContractImage) {
        const filePath = path.join(__dirname, '..', 'public', existingProperty.ContractImage);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      updateData.ContractImage = `/uploads/properties/${req.file.filename}`;
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "تم تحديث العقار بنجاح",
      data: updatedProperty
    });

  } catch (error) {
    console.error("Error updating property:", error);
    
    let errorMessage = "حدث خطأ أثناء تحديث العقار";
    if (error.name === 'ValidationError') {
      errorMessage = Object.values(error.errors).map(val => val.message).join(', ');
    } else if (error.name === 'CastError') {
      errorMessage = "معرف العقار غير صحيح";
    }

    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
}

// Expert property deletion with file cleanup
async function deleteProperty(req, res) {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "العقار غير موجود"
      });
    }

    // Delete contract file if exists
    if (property.ContractImage) {
      const filePath = path.join(__dirname, '..', 'public', property.ContractImage);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Property.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "تم حذف العقار بنجاح"
    });

  } catch (error) {
    console.error("Error deleting property:", error);
    
    res.status(500).json({
      success: false,
      message: error.message || "فشل في حذف العقار"
    });
  }
}

// Get property by ID
async function getPropertyById(req, res) {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "العقار غير موجود"
      });
    }

    res.status(200).json({
      success: true,
      data: property
    });

  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({
      success: false,
      message: "فشل في جلب العقار"
    });
  }
}

module.exports = {
  upload,
  createProperty,
  getAllProperties,
  updateProperty,
  deleteProperty,
  getPropertyById
};