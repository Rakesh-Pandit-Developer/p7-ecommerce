const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');
const { uploadCategoryImage, optimizeImage } = require('../middleware/upload');
const { auditMiddleware } = require('../middleware/audit');

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Admin routes
router.use(protect, admin);
router.post('/', uploadCategoryImage, optimizeImage, auditMiddleware('create', 'category'), createCategory);
router.put('/:id', uploadCategoryImage, optimizeImage, auditMiddleware('update', 'category'), updateCategory);
router.delete('/:id', auditMiddleware('delete', 'category'), deleteCategory);

module.exports = router;
