const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getLowStockProducts,
  bulkImportProducts,
  exportProducts,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const { uploadProductImages, optimizeImage, parseFormData } = require('../middleware/upload');
const { auditMiddleware } = require('../middleware/audit');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:idOrCode', getProduct);

// Admin routes
router.use(protect, admin);
router.post('/', uploadProductImages, parseFormData, optimizeImage, auditMiddleware('create', 'product'), createProduct);
router.put('/:id', uploadProductImages, parseFormData, optimizeImage, auditMiddleware('update', 'product'), updateProduct);
router.delete('/:id', auditMiddleware('delete', 'product'), deleteProduct);
router.get('/admin/low-stock', getLowStockProducts);
router.post('/admin/bulk-import', auditMiddleware('import', 'product'), bulkImportProducts);
router.get('/admin/export', auditMiddleware('export', 'product'), exportProducts);

module.exports = router;
