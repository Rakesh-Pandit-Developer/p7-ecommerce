const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateUserRole,
  deleteUser,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');

// All routes require admin access
router.use(protect, admin);

router.get('/', getUsers);
router.patch('/:id', auditMiddleware('update', 'user'), updateUserRole);
router.delete('/:id', auditMiddleware('delete', 'user'), deleteUser);

module.exports = router;
