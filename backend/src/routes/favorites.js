const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  syncFavorites,
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getFavorites);
router.post('/', addToFavorites);
router.post('/sync', syncFavorites);
router.delete('/:productId', removeFromFavorites);

module.exports = router;
