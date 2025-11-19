const { google } = require('googleapis');
const Settings = require('../models/Settings');

let sheets = null;
let spreadsheetId = null;

// Initialize Google Sheets API
const initializeGoogleSheets = async () => {
  try {
    const googleSheetsSettings = await Settings.findOne({ key: 'google_sheets_config' });
    
    if (!googleSheetsSettings) {
      console.warn('Google Sheets settings not configured');
      return null;
    }

    const config = googleSheetsSettings.value;
    spreadsheetId = config.spreadsheetId;

    const auth = new google.auth.GoogleAuth({
      credentials: config.credentials || JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    sheets = google.sheets({ version: 'v4', auth: authClient });

    return sheets;
  } catch (error) {
    console.error('Google Sheets initialization error:', error);
    return null;
  }
};

// Log order to Google Sheets
const logOrderToSheets = async (order) => {
  try {
    if (!sheets) {
      await initializeGoogleSheets();
    }

    if (!sheets || !spreadsheetId) {
      throw new Error('Google Sheets not initialized');
    }

    const sheetName = 'Orders';
    
    // Prepare row data
    const rowData = [
      order.orderNumber,
      new Date(order.createdAt).toLocaleString(),
      order.customerInfo.name,
      order.customerInfo.email,
      order.customerInfo.phone,
      order.customerInfo.address || '',
      order.items.map(item => `${item.name} (${item.code}) x${item.quantity}`).join('; '),
      order.totalAmount.toFixed(2),
      order.paymentMethod,
      order.paymentStatus,
      order.orderStatus,
      order.halfPaymentAmount ? order.halfPaymentAmount.toFixed(2) : '',
      order.paymentScreenshot?.url || '',
      order.notes || '',
    ];

    // Append row to sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:N`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowData],
      },
    });

    console.log('Order logged to Google Sheets:', response.data);
    return response.data;
  } catch (error) {
    console.error('Log order to Google Sheets error:', error);
    
    // Try to create sheet if it doesn't exist
    if (error.message && error.message.includes('Unable to parse range')) {
      await createOrdersSheet();
      return logOrderToSheets(order);
    }
    
    throw error;
  }
};

// Create Orders sheet with headers
const createOrdersSheet = async () => {
  try {
    if (!sheets || !spreadsheetId) {
      throw new Error('Google Sheets not initialized');
    }

    const sheetName = 'Orders';
    
    // Create sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
              },
            },
          },
        ],
      },
    });

    // Add headers
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Email',
      'Phone',
      'Address',
      'Items',
      'Total Amount',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Half Payment Amount',
      'Payment Screenshot',
      'Notes',
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:N1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers],
      },
    });

    // Format headers
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.4,
                    green: 0.5,
                    blue: 0.9,
                  },
                  textFormat: {
                    foregroundColor: {
                      red: 1,
                      green: 1,
                      blue: 1,
                    },
                    fontSize: 11,
                    bold: true,
                  },
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            },
          },
        ],
      },
    });

    console.log('Orders sheet created successfully');
  } catch (error) {
    console.error('Create Orders sheet error:', error);
    throw error;
  }
};

// Update order status in Google Sheets
const updateOrderStatusInSheets = async (orderNumber, newStatus) => {
  try {
    if (!sheets || !spreadsheetId) {
      await initializeGoogleSheets();
    }

    if (!sheets || !spreadsheetId) {
      throw new Error('Google Sheets not initialized');
    }

    const sheetName = 'Orders';
    
    // Get all rows
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:K`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No data found in sheet');
    }

    // Find row with matching order number
    const rowIndex = rows.findIndex((row) => row[0] === orderNumber);
    
    if (rowIndex === -1) {
      throw new Error('Order not found in sheet');
    }

    // Update status (column K is index 10)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!K${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[newStatus]],
      },
    });

    console.log('Order status updated in Google Sheets');
  } catch (error) {
    console.error('Update order status in Google Sheets error:', error);
    throw error;
  }
};

module.exports = {
  initializeGoogleSheets,
  logOrderToSheets,
  updateOrderStatusInSheets,
  createOrdersSheet,
};
