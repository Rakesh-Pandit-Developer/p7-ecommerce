const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

// Create uploads directory if it doesn't exist
const createUploadDir = async (dir) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    if (file.fieldname === 'productImages' || file.fieldname === 'categoryImage') {
      uploadPath += 'products/';
    } else if (file.fieldname === 'paymentScreenshot') {
      uploadPath += 'payments/';
    } else if (file.fieldname === 'reviewImages') {
      uploadPath += 'reviews/';
    } else {
      uploadPath += 'others/';
    }
    
    await createUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Image optimization middleware
const optimizeImage = async (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  try {
    const files = req.file ? [req.file] : Array.isArray(req.files) ? req.files : Object.values(req.files).flat();

    for (const file of files) {
      // Skip optimization for very small files or if sharp fails
      try {
        const optimizedPath = file.path.replace(/\.[^.]+$/, '-optimized' + path.extname(file.path));
        
        await sharp(file.path)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 85 })
          .png({ quality: 85 })
          .webp({ quality: 85 })
          .toFile(optimizedPath);
        
        // Replace original with optimized
        await fs.unlink(file.path);
        await fs.rename(optimizedPath, file.path);
      } catch (fileError) {
        console.error('Error optimizing image:', fileError.message);
        // Continue without optimization if it fails
      }
    }

    next();
  } catch (error) {
    // Don't fail the request if optimization fails
    console.error('Image optimization error:', error);
    next();
  }
};

// Parse nested FormData fields (e.g., customerInfo[name])
const parseFormData = (req, res, next) => {
  if (!req.body) {
    return next();
  }

  // Parse nested objects from FormData format
  const parsedBody = {};
  
  for (const key in req.body) {
    const matches = key.match(/^(\w+)\[(.+)\]$/);
    
    if (matches) {
      const [, objectName, propertyName] = matches;
      
      if (!parsedBody[objectName]) {
        parsedBody[objectName] = {};
      }
      
      // Handle nested arrays (e.g., items[0][name])
      const arrayMatch = propertyName.match(/^(\d+)\]\[(.+)$/);
      if (arrayMatch) {
        const [, index, prop] = arrayMatch;
        if (!parsedBody[objectName]) {
          parsedBody[objectName] = [];
        }
        if (!parsedBody[objectName][index]) {
          parsedBody[objectName][index] = {};
        }
        parsedBody[objectName][index][prop] = req.body[key];
      } else {
        parsedBody[objectName][propertyName] = req.body[key];
      }
    } else {
      parsedBody[key] = req.body[key];
    }
  }
  
  req.body = parsedBody;
  next();
};

module.exports = {
  upload,
  optimizeImage,
  parseFormData,
  uploadProductImages: upload.array('productImages', 10),
  uploadCategoryImage: upload.single('categoryImage'),
  uploadPaymentScreenshot: upload.single('paymentScreenshot'),
  uploadReviewImages: upload.array('reviewImages', 5),
};
