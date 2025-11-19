const Settings = require('../models/Settings');

// Generate WhatsApp message for single product
const generateProductWhatsAppMessage = async (product, customerName = '') => {
  const whatsappSettings = await Settings.findOne({ key: 'whatsapp_number' });
  const companyName = await Settings.findOne({ key: 'company_name' });

  const message = `Hi${customerName ? ` ${customerName}` : ''}!

I'm interested in this product:

📦 *Product:* ${product.name}
🔢 *Code:* ${product.code}
💰 *Price:* $${product.price.toFixed(2)}

${product.description ? `ℹ️ *Description:* ${product.description.substring(0, 100)}...` : ''}

Could you please provide more information?

Thank you!`;

  const whatsappNumber = whatsappSettings?.value || process.env.WHATSAPP_NUMBER || '';
  const encodedMessage = encodeURIComponent(message);
  
  return {
    message,
    url: `https://wa.me/${whatsappNumber}?text=${encodedMessage}`,
    number: whatsappNumber,
  };
};

// Generate WhatsApp message for order
const generateOrderWhatsAppMessage = async (order) => {
  const whatsappSettings = await Settings.findOne({ key: 'whatsapp_number' });
  const companyName = await Settings.findOne({ key: 'company_name' });

  const itemsList = order.items
    .map((item, index) => `${index + 1}. ${item.name} (${item.code}) - Qty: ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`)
    .join('\n');

  const message = `🛒 *New Order Request*

📋 *Order Details:*
${order.orderNumber ? `Order #: ${order.orderNumber}` : ''}

👤 *Customer Information:*
Name: ${order.customerInfo.name}
Email: ${order.customerInfo.email}
Phone: ${order.customerInfo.phone}
${order.customerInfo.address ? `Address: ${order.customerInfo.address}` : ''}

📦 *Items:*
${itemsList}

💰 *Total Amount:* $${order.totalAmount.toFixed(2)}

💳 *Payment:* ${order.paymentMethod === 'half-payment' ? `Half Payment ($${(order.totalAmount / 2).toFixed(2)} required)` : order.paymentMethod}

${order.notes ? `📝 *Notes:* ${order.notes}` : ''}

Thank you!`;

  const whatsappNumber = whatsappSettings?.value || process.env.WHATSAPP_NUMBER || '';
  const encodedMessage = encodeURIComponent(message);
  
  return {
    message,
    url: `https://wa.me/${whatsappNumber}?text=${encodedMessage}`,
    number: whatsappNumber,
  };
};

// Generate WhatsApp message for multiple products
const generateMultiProductWhatsAppMessage = async (products, customerInfo = {}) => {
  const whatsappSettings = await Settings.findOne({ key: 'whatsapp_number' });
  const companyName = await Settings.findOne({ key: 'company_name' });

  const productsList = products
    .map((item, index) => {
      const quantity = item.quantity || 1;
      const price = item.price || 0;
      return `${index + 1}. ${item.name} (${item.code}) - Qty: ${quantity} - $${(price * quantity).toFixed(2)}`;
    })
    .join('\n');

  const totalAmount = products.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  const message = `Hi${customerInfo.name ? ` ${customerInfo.name}` : ''}!

I would like to order the following products:

📦 *Products:*
${productsList}

💰 *Total Amount:* $${totalAmount.toFixed(2)}

${customerInfo.email ? `📧 Email: ${customerInfo.email}` : ''}
${customerInfo.phone ? `📱 Phone: ${customerInfo.phone}` : ''}
${customerInfo.notes ? `\n📝 *Notes:* ${customerInfo.notes}` : ''}

Please confirm availability and next steps.

Thank you!`;

  const whatsappNumber = whatsappSettings?.value || process.env.WHATSAPP_NUMBER || '';
  const encodedMessage = encodeURIComponent(message);
  
  return {
    message,
    url: `https://wa.me/${whatsappNumber}?text=${encodedMessage}`,
    number: whatsappNumber,
  };
};

// Send WhatsApp notification (returns URL for client-side opening)
const generateWhatsAppNotificationURL = async (phoneNumber, message) => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

module.exports = {
  generateProductWhatsAppMessage,
  generateOrderWhatsAppMessage,
  generateMultiProductWhatsAppMessage,
  generateWhatsAppNotificationURL,
};
