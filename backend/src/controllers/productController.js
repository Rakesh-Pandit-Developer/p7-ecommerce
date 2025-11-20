const supabase = require('../config/supabase');

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
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = req.query;

    let query = supabase
      .from('products')
      .select('*, categories:category_id(id, name, description)', { count: 'exact' })
      .eq('active', true);

    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category_id', category);
    }

    if (featured !== undefined) {
      query = query.eq('featured', featured === 'true');
    }

    if (minPrice) {
      query = query.gte('price', Number(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price', Number(maxPrice));
    }

    const offset = (page - 1) * limit;
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data: products, count, error } = await query;

    if (error) throw error;

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

exports.getProduct = async (req, res, next) => {
  try {
    const { idOrCode } = req.params;

    let { data: product, error } = await supabase
      .from('products')
      .select('*, categories:category_id(id, name, description)')
      .eq('id', idOrCode)
      .maybeSingle();

    if (!product) {
      const result = await supabase
        .from('products')
        .select('*, categories:category_id(id, name, description)')
        .eq('code', idOrCode)
        .maybeSingle();

      product = result.data;
      error = result.error;
    }

    if (error) throw error;

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

exports.createProduct = async (req, res, next) => {
  try {
    console.log('Creating product with data:', req.body);
    console.log('Files received:', req.files?.length || 0);

    if (typeof req.body.specifications === 'string') {
      req.body.specifications = JSON.parse(req.body.specifications);
    }
    if (typeof req.body.tags === 'string') {
      req.body.tags = JSON.parse(req.body.tags);
    }

    const productData = {
      code: req.body.code,
      name: req.body.name,
      description: req.body.description,
      specifications: req.body.specifications || {},
      price: Number(req.body.price),
      compare_price: req.body.compare_price ? Number(req.body.compare_price) : null,
      stock: Number(req.body.stock || 0),
      low_stock_threshold: Number(req.body.lowStockThreshold || 10),
      category_id: req.body.category,
      featured: req.body.featured === 'true' || req.body.featured === true,
      active: req.body.active !== 'false' && req.body.active !== false,
      tags: req.body.tags || [],
      seo_title: req.body.seoTitle || null,
      seo_description: req.body.seoDescription || null,
      seo_keywords: req.body.seoKeywords || [],
      images: [],
    };

    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file, index) => ({
        url: `/uploads/products/${file.filename}`,
        alt: req.body.name || `Product image ${index + 1}`,
        isPrimary: index === 0,
      }));
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert(productData)
      .select('*, categories:category_id(id, name, description)')
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create product',
    });
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    console.log('Updating product:', req.params.id);
    console.log('Update data:', req.body);

    if (typeof req.body.specifications === 'string') {
      req.body.specifications = JSON.parse(req.body.specifications);
    }
    if (typeof req.body.tags === 'string') {
      req.body.tags = JSON.parse(req.body.tags);
    }

    let existingImages = [];
    if (req.body.existingImages) {
      if (typeof req.body.existingImages === 'string') {
        existingImages = JSON.parse(req.body.existingImages);
      } else {
        existingImages = req.body.existingImages;
      }
    }

    const updateData = {
      code: req.body.code,
      name: req.body.name,
      description: req.body.description,
      specifications: req.body.specifications || {},
      price: Number(req.body.price),
      compare_price: req.body.compare_price ? Number(req.body.compare_price) : null,
      stock: Number(req.body.stock || 0),
      low_stock_threshold: Number(req.body.lowStockThreshold || 10),
      category_id: req.body.category,
      featured: req.body.featured === 'true' || req.body.featured === true,
      active: req.body.active !== 'false' && req.body.active !== false,
      tags: req.body.tags || [],
    };

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: `/uploads/products/${file.filename}`,
        alt: req.body.name,
        isPrimary: existingImages.length === 0 && index === 0,
      }));
      updateData.images = [...existingImages, ...newImages];
    } else if (existingImages.length > 0) {
      updateData.images = existingImages;
    }

    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', req.params.id)
      .select('*, categories:category_id(id, name, description)')
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Product update error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update product',
    });
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = req.query.limit || 10;

    const { data: products, error } = await supabase
      .from('products')
      .select('*, categories:category_id(id, name, description)')
      .eq('featured', true)
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

exports.getLowStockProducts = async (req, res, next) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*, categories:category_id(id, name, description)')
      .eq('active', true)
      .order('stock', { ascending: true });

    if (error) throw error;

    const lowStockProducts = products.filter(p => p.stock <= p.low_stock_threshold);

    res.status(200).json({
      success: true,
      data: lowStockProducts,
    });
  } catch (error) {
    next(error);
  }
};

exports.bulkImportProducts = async (req, res, next) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Products array is required',
      });
    }

    const { data, error } = await supabase
      .from('products')
      .insert(products)
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
      message: `${data.length} products imported successfully`,
    });
  } catch (error) {
    next(error);
  }
};

exports.exportProducts = async (req, res, next) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*, categories:category_id(id, name, description)');

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
