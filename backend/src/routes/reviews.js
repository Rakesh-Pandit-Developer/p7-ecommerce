const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  approveReview,
  getAllReviews,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');

router.get('/products/:productId', getProductReviews);
router.post('/', protect, createReview);

// Admin routes
router.get('/', protect, admin, getAllReviews);
router.put('/:id/approve', protect, admin, approveReview);
router.delete('/:id', protect, admin, auditMiddleware('delete', 'review'), deleteReview);

module.exports = router;
