const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmationEmail, addOrderToGoogleSheets } = require('../utils/queue');
const { generateOrderWhatsAppMessage } = require('../utils/whatsapp');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public/Private
exports.createOrder = async (req, res, next) => {
  try {
    const { items, customerInfo, paymentMethod, selectedPaymentGateway, notes } = req.body;

    console.log('Received order data:', {
      customerInfo,
      paymentMethod,
      selectedPaymentGateway,
      itemsCount: items?.length,
      notes,
    });

    // Validate items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.product} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        code: product.code,
        quantity: item.quantity,
        price: product.price,
        image: product.images?.[0]?.url || '',
      });

      totalAmount += product.price * item.quantity;
    }

    // Handle payment screenshot upload
    let paymentScreenshot = null;
    if (req.file) {
      paymentScreenshot = {
        url: `/uploads/payments/${req.file.filename}`,
        uploadedAt: new Date(),
      };
    }

    // Determine payment status
    let paymentStatus = 'pending';
    if (paymentMethod === 'cod') {
      paymentStatus = 'pending';
    } else if (paymentMethod === 'full-payment' && paymentScreenshot) {
      paymentStatus = 'paid';
    } else if (paymentMethod === 'half-payment' && paymentScreenshot) {
      paymentStatus = 'half-paid';
    }

    // Create order
    const order = await Order.create({
      user: req.user?._id,
      customerInfo,
      items: orderItems,
      totalAmount,
      paymentMethod,
      selectedPaymentGateway,
      paymentStatus,
      paymentScreenshot,
      halfPaymentAmount: paymentMethod === 'half-payment' ? totalAmount / 2 : null,
      notes,
    });

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Queue email and Google Sheets logging
    await sendOrderConfirmationEmail(order._id);
    await addOrderToGoogleSheets(order._id);

    // Generate WhatsApp message
    const whatsappData = await generateOrderWhatsAppMessage(order);

    res.status(201).json({
      success: true,
      data: order,
      whatsappUrl: whatsappData.url,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Order creation error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      errors: error.errors,
    });
    
    // Return detailed error message
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', messages);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }
    
    next(error);
  }
};

// @desc    Get all orders (with filters for admin)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    // User-specific orders if not admin
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    if (status) {
      query.orderStatus = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name code images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
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

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name code images price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Make sure user can only see their own orders (unless admin)
    if (order.user && req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.orderStatus = orderStatus;

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (orderStatus === 'delivered') {
      order.deliveredAt = new Date();
    }

    if (orderStatus === 'cancelled') {
      order.cancelledAt = new Date();
      order.cancellationReason = req.body.cancellationReason;

      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order status updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status (Admin only)
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
      message: 'Payment status updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order statistics (Admin only)
// @route   GET /api/orders/stats
// @access  Private/Admin
exports.getOrderStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const completedOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    
    const revenueStats = await Order.aggregate([
      { $match: { paymentStatus: { $in: ['paid', 'half-paid'] } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

    // Top products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        topProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};
