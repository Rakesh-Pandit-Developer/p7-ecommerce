const Bull = require('bull');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('./email');
const { logOrderToSheets, updateOrderStatusInSheets } = require('./googleSheets');
const Order = require('../models/Order');

// Create queues
const emailQueue = new Bull('email', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

const googleSheetsQueue = new Bull('googleSheets', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Email queue processors
emailQueue.process('order-confirmation', async (job) => {
  const { orderId } = job.data;
  
  try {
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      throw new Error('Order not found');
    }

    await sendOrderConfirmation(order);
    
    // Update order status
    await Order.findByIdAndUpdate(orderId, { emailSent: true });
    
    return { success: true, orderId };
  } catch (error) {
    console.error('Order confirmation email job error:', error);
    throw error;
  }
});

emailQueue.process('order-status-update', async (job) => {
  const { orderId, newStatus } = job.data;
  
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    await sendOrderStatusUpdate(order, newStatus);
    
    return { success: true, orderId };
  } catch (error) {
    console.error('Order status update email job error:', error);
    throw error;
  }
});

// Google Sheets queue processors
googleSheetsQueue.process('log-order', async (job) => {
  const { orderId } = job.data;
  
  try {
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      throw new Error('Order not found');
    }

    await logOrderToSheets(order);
    
    // Update order status
    await Order.findByIdAndUpdate(orderId, { googleSheetLogged: true });
    
    return { success: true, orderId };
  } catch (error) {
    console.error('Log order to Google Sheets job error:', error);
    throw error;
  }
});

googleSheetsQueue.process('update-order-status', async (job) => {
  const { orderNumber, newStatus } = job.data;
  
  try {
    await updateOrderStatusInSheets(orderNumber, newStatus);
    
    return { success: true, orderNumber };
  } catch (error) {
    console.error('Update order status in Google Sheets job error:', error);
    throw error;
  }
});

// Queue event handlers
emailQueue.on('completed', (job, result) => {
  console.log(`Email job ${job.id} completed:`, result);
});

emailQueue.on('failed', (job, error) => {
  console.error(`Email job ${job.id} failed:`, error.message);
});

googleSheetsQueue.on('completed', (job, result) => {
  console.log(`Google Sheets job ${job.id} completed:`, result);
});

googleSheetsQueue.on('failed', (job, error) => {
  console.error(`Google Sheets job ${job.id} failed:`, error.message);
});

// Add jobs to queues
const sendOrderConfirmationEmail = (orderId) => {
  return emailQueue.add('order-confirmation', { orderId }, {
    priority: 1,
    removeOnComplete: true,
  });
};

const sendOrderStatusUpdateEmail = (orderId, newStatus) => {
  return emailQueue.add('order-status-update', { orderId, newStatus }, {
    priority: 2,
    removeOnComplete: true,
  });
};

const addOrderToGoogleSheets = (orderId) => {
  return googleSheetsQueue.add('log-order', { orderId }, {
    priority: 1,
    removeOnComplete: true,
  });
};

const updateOrderInGoogleSheets = (orderNumber, newStatus) => {
  return googleSheetsQueue.add('update-order-status', { orderNumber, newStatus }, {
    priority: 2,
    removeOnComplete: true,
  });
};

module.exports = {
  emailQueue,
  googleSheetsQueue,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  addOrderToGoogleSheets,
  updateOrderInGoogleSheets,
};
