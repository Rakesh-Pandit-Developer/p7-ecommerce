const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderStats,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');
const { uploadPaymentScreenshot, optimizeImage, parseFormData } = require('../middleware/upload');
const { auditMiddleware } = require('../middleware/audit');

// Public/Private routes
router.post('/', uploadPaymentScreenshot, parseFormData, optimizeImage, createOrder);

// Protected routes
router.use(protect);
router.get('/', getOrders);
router.get('/:id', getOrder);

// Admin routes
router.put('/:id/status', admin, auditMiddleware('order_status_change', 'order'), updateOrderStatus);
router.put('/:id/payment', admin, auditMiddleware('payment_verification', 'order'), updatePaymentStatus);
router.get('/admin/stats', admin, getOrderStats);

module.exports = router;
