const express = require('express');
const {
  register,
  login,
  getProfile,
  updateProfile,
  registerValidation,
  loginValidation,
  validate,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Register route
router.post('/register', registerValidation, validate, register);

// Login route
router.post('/login', loginValidation, validate, login);

// Profile routes (protected)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;