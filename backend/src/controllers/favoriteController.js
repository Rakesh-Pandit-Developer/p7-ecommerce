const Favorite = require('../models/Favorite');
const Product = require('../models/Product');

// @desc    Get user favorites
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate('product', 'name code price images rating stock')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to favorites
// @route   POST /api/favorites
// @access  Private
exports.addToFavorites = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      product: productId,
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Product already in favorites',
      });
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      product: productId,
    });

    await favorite.populate('product', 'name code price images rating stock');

    res.status(201).json({
      success: true,
      data: favorite,
      message: 'Product added to favorites',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from favorites
// @route   DELETE /api/favorites/:productId
// @access  Private
exports.removeFromFavorites = async (req, res, next) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      product: req.params.productId,
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product removed from favorites',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync local favorites with server (after login)
// @route   POST /api/favorites/sync
// @access  Private
exports.syncFavorites = async (req, res, next) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs must be an array',
      });
    }

    const favorites = [];

    for (const productId of productIds) {
      // Check if already exists
      const existingFavorite = await Favorite.findOne({
        user: req.user._id,
        product: productId,
      });

      if (!existingFavorite) {
        const product = await Product.findById(productId);
        if (product) {
          const favorite = await Favorite.create({
            user: req.user._id,
            product: productId,
          });
          favorites.push(favorite);
        }
      }
    }

    res.status(200).json({
      success: true,
      data: favorites,
      message: `${favorites.length} favorites synced`,
    });
  } catch (error) {
    next(error);
  }
};
