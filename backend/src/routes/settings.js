const express = require('express');
const router = express.Router();
const {
  getSettings,
  getSetting,
  upsertSetting,
  deleteSetting,
  bulkUpdateSettings,
} = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');

router.use(protect, admin);

router.get('/', getSettings);
router.put('/', auditMiddleware('bulk_update', 'settings'), bulkUpdateSettings);
router.get('/:key', getSetting);
router.put('/:key', auditMiddleware('settings_change', 'settings'), upsertSetting);
router.delete('/:key', auditMiddleware('delete', 'settings'), deleteSetting);

module.exports = router;
