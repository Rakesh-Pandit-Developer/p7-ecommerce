const Product = require('../models/Product');

// @desc    Get all products with filtering, pagination, and sorting
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      category,
      featured,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build query
    const query = { active: true };

    if (search) {
      // Use regex for flexible search (partial matches)
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Execute query with pagination
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID or code
// @route   GET /api/products/:idOrCode
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const { idOrCode } = req.params;

    // Try to find by ID first, then by code
    let product = await Product.findById(idOrCode).populate('category');
    
    if (!product) {
      product = await Product.findOne({ code: idOrCode }).populate('category');
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    console.log('Creating product with data:', req.body);
    console.log('Files received:', req.files?.length || 0);

    // Parse JSON fields if they're strings
    if (typeof req.body.specifications === 'string') {
      req.body.specifications = JSON.parse(req.body.specifications);
    }
    if (typeof req.body.tags === 'string') {
      req.body.tags = JSON.parse(req.body.tags);
    }

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map((file, index) => ({
        url: `/uploads/products/${file.filename}`,
        alt: req.body.name || `Product image ${index + 1}`,
        isPrimary: index === 0,
      }));
    } else {
      // Ensure images array exists even if no files uploaded
      req.body.images = [];
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Product creation error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }
    next(error);
  }
};

// @desc    Update product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    console.log('Updating product:', req.params.id);
    console.log('Update data:', req.body);
    console.log('Files received:', req.files?.length || 0);

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Parse JSON fields if they're strings
    if (typeof req.body.specifications === 'string') {
      req.body.specifications = JSON.parse(req.body.specifications);
    }
    if (typeof req.body.tags === 'string') {
      req.body.tags = JSON.parse(req.body.tags);
    }

    // Handle existing images
    let existingImages = [];
    if (req.body.existingImages) {
      if (typeof req.body.existingImages === 'string') {
        existingImages = JSON.parse(req.body.existingImages);
      } else {
        existingImages = req.body.existingImages;
      }
    }

    // Handle new file uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: `/uploads/products/${file.filename}`,
        alt: req.body.name || product.name,
        isPrimary: existingImages.length === 0 && index === 0,
      }));

      req.body.images = [...existingImages, ...newImages];
    } else if (existingImages.length > 0) {
      req.body.images = existingImages;
    } else {
      // No existing images and no new files
      req.body.images = [];
    }

    // Remove the existingImages field before update
    delete req.body.existingImages;

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Product update error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }
    next(error);
  }
};

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await product.remove();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = req.query.limit || 10;

    const products = await Product.find({ featured: true, active: true })
      .populate('category', 'name slug')
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock products (Admin only)
// @route   GET /api/products/low-stock
// @access  Private/Admin
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ active: true })
      .populate('category', 'name slug')
      .lean();

    const lowStockProducts = products.filter((product) => product.stock <= product.lowStockThreshold);

    res.status(200).json({
      success: true,
      data: lowStockProducts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk import products (Admin only)
// @route   POST /api/products/bulk-import
// @access  Private/Admin
exports.bulkImportProducts = async (req, res, next) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Products array is required',
      });
    }

    const importedProducts = await Product.insertMany(products, {
      ordered: false,
      rawResult: true,
    });

    res.status(201).json({
      success: true,
      data: importedProducts,
      message: `${importedProducts.insertedCount} products imported successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export products (Admin only)
// @route   GET /api/products/export
// @access  Private/Admin
exports.exportProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate('category', 'name slug')
      .lean();

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
