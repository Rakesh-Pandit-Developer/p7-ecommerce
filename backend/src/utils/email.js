const nodemailer = require('nodemailer');
const Settings = require('../models/Settings');

// Create transporter
let transporter = null;

const initializeTransporter = async () => {
  try {
    const emailSettings = await Settings.findOne({ key: 'email_config' });
    
    if (!emailSettings) {
      console.warn('Email settings not configured');
      return null;
    }

    const config = emailSettings.value;
    
    transporter = nodemailer.createTransporter({
      host: config.host || process.env.EMAIL_HOST,
      port: config.port || process.env.EMAIL_PORT || 587,
      secure: config.secure || false,
      auth: {
        user: config.user || process.env.EMAIL_USER,
        pass: config.pass || process.env.EMAIL_PASS,
      },
    });

    return transporter;
  } catch (error) {
    console.error('Email transporter initialization error:', error);
    return null;
  }
};

// Send order confirmation email
const sendOrderConfirmation = async (order) => {
  try {
    if (!transporter) {
      await initializeTransporter();
    }

    if (!transporter) {
      throw new Error('Email transporter not initialized');
    }

    const ownerEmail = await Settings.findOne({ key: 'owner_email' });
    const companyName = await Settings.findOne({ key: 'company_name' });

    const mailOptions = {
      from: `"${companyName?.value || 'E-Commerce'}" <${process.env.EMAIL_USER}>`,
      to: order.customerInfo.email,
      cc: ownerEmail?.value || 'rkp12433@gmail.com',
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: generateOrderConfirmationHTML(order, companyName?.value),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Send order confirmation email error:', error);
    throw error;
  }
};

// Send order status update email
const sendOrderStatusUpdate = async (order, newStatus) => {
  try {
    if (!transporter) {
      await initializeTransporter();
    }

    if (!transporter) {
      throw new Error('Email transporter not initialized');
    }

    const companyName = await Settings.findOne({ key: 'company_name' });

    const mailOptions = {
      from: `"${companyName?.value || 'E-Commerce'}" <${process.env.EMAIL_USER}>`,
      to: order.customerInfo.email,
      subject: `Order Update - ${order.orderNumber}`,
      html: generateOrderStatusUpdateHTML(order, newStatus, companyName?.value),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order status update email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Send order status update email error:', error);
    throw error;
  }
};

// Generate order confirmation HTML
const generateOrderConfirmationHTML = (order, companyName = 'E-Commerce') => {
  const itemsHTML = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} (${item.code})</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">${companyName}</h1>
        <p style="margin: 10px 0 0; font-size: 16px;">Order Confirmation</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-top: 0;">Dear ${order.customerInfo.name},</p>
        <p>Thank you for your order! We've received it and will process it shortly.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #667eea;">Order Details</h2>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
          <p><strong>Order Status:</strong> ${order.orderStatus}</p>
        </div>
        
        <table style="width: 100%; background: white; border-radius: 8px; overflow: hidden; margin: 20px 0;">
          <thead>
            <tr style="background: #667eea; color: white;">
              <th style="padding: 12px; text-align: left;">Product</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Price</th>
              <th style="padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
            <tr>
              <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px;">Total:</td>
              <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #667eea;">Rs. ${order.totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        ${
          order.paymentMethod === 'half-payment'
            ? `
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="margin: 0;"><strong>⚠️ Half Payment Required:</strong></p>
          <p style="margin: 5px 0 0;">Please pay Rs. ${(order.totalAmount / 2).toFixed(2)} to confirm your order.</p>
        </div>
        `
            : ''
        }
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Contact Information</h3>
          <p><strong>Email:</strong> ${order.customerInfo.email}</p>
          <p><strong>Phone:</strong> ${order.customerInfo.phone}</p>
          ${order.customerInfo.address ? `<p><strong>Address:</strong> ${order.customerInfo.address}</p>` : ''}
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
          If you have any questions, please don't hesitate to contact us.
        </p>
      </div>
    </body>
    </html>
  `;
};

// Generate order status update HTML
const generateOrderStatusUpdateHTML = (order, newStatus, companyName = 'E-Commerce') => {
  const statusMessages = {
    confirmed: 'Your order has been confirmed and is being prepared.',
    processing: 'Your order is currently being processed.',
    shipped: `Your order has been shipped! ${order.trackingNumber ? `Tracking Number: ${order.trackingNumber}` : ''}`,
    delivered: 'Your order has been delivered. Thank you for shopping with us!',
    cancelled: 'Your order has been cancelled.',
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Order Status Update</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">${companyName}</h1>
        <p style="margin: 10px 0 0; font-size: 16px;">Order Status Update</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; margin-top: 0;">Dear ${order.customerInfo.name},</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h2 style="color: #667eea; margin-top: 0;">Order #${order.orderNumber}</h2>
          <p style="font-size: 18px; margin: 20px 0;">${statusMessages[newStatus] || `Status updated to: ${newStatus}`}</p>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
          Thank you for your business!
        </p>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  initializeTransporter,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
};
