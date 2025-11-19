const Settings = require('../models/Settings');

// @desc    Get all settings or by category (Admin only)
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};

    const settings = await Settings.find(query).lean();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single setting by key
// @route   GET /api/settings/:key
// @access  Private/Admin
exports.getSetting = async (req, res, next) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found',
      });
    }

    res.status(200).json({
      success: true,
      data: setting,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update setting (Admin only)
// @route   PUT /api/settings/:key
// @access  Private/Admin
exports.upsertSetting = async (req, res, next) => {
  try {
    const { value, category, description } = req.body;

    const setting = await Settings.findOneAndUpdate(
      { key: req.params.key },
      { value, category, description },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: setting,
      message: 'Setting updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete setting (Admin only)
// @route   DELETE /api/settings/:key
// @access  Private/Admin
exports.deleteSetting = async (req, res, next) => {
  try {
    const setting = await Settings.findOneAndDelete({ key: req.params.key });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Setting deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update settings (Admin only)
// @route   PUT /api/settings
// @access  Private/Admin
exports.bulkUpdateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings data',
      });
    }

    const updatePromises = Object.entries(settings).map(([key, value]) =>
      Settings.findOneAndUpdate(
        { key },
        { value },
        { new: true, upsert: false }
      )
    );

    await Promise.all(updatePromises);

    const updatedSettings = await Settings.find();

    res.status(200).json({
      success: true,
      data: updatedSettings,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
