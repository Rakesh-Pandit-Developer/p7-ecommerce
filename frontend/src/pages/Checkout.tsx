import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCreditCard, FiCheck, FiUpload, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api, { getImageUrl } from '../utils/api';
import Loading from '../components/ui/Loading';
import { PLACEHOLDER_PRODUCT_IMAGE } from '../utils/placeholder';

interface PaymentMethod {
  id: string;
  name: string;
  qrCode: string;
  details: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'esewa',
    name: 'eSewa',
    qrCode: '/payment-qr/esewa-qr.png',
    details: 'eSewa ID: 9779806812433',
  },
  {
    id: 'imepay',
    name: 'IME Pay',
    qrCode: '/payment-qr/imepay-qr.png',
    details: 'IME Pay: 9779806812433',
  },
  {
    id: 'connectips',
    name: 'Connect IPS',
    qrCode: '/payment-qr/connectips-qr.png',
    details: 'Connect IPS Account',
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    qrCode: '/payment-qr/bank-qr.png',
    details: 'Bank: [Your Bank Name]\nAccount: [Account Number]\nAccount Name: [Account Holder Name]',
  },
];

const Checkout: React.FC = () => {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    paymentMethod: 'half-payment',
    selectedPaymentGateway: 'esewa',
    notes: '',
  });

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      }));
    }
  }, [user]);

const downloadQRCode = (paymentMethodId: string) => {
  const method = paymentMethods.find(m => m.id === paymentMethodId);
  if (!method) return;

  // Create a temporary link to download the QR code
  const link = document.createElement('a');
  link.href = method.qrCode;
  link.download = `${method.name}-QR-Code.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success(`${method.name} QR code downloaded`);
};

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setPaymentScreenshot(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Validate payment screenshot for non-COD orders
    if (formData.paymentMethod !== 'cod' && !paymentScreenshot) {
      toast.error('Please upload payment screenshot');
      return;
    }

    setLoading(true);

    try {
      const orderData = new FormData();
      
      console.log('Creating order with:', {
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        },
        paymentMethod: formData.paymentMethod,
        selectedPaymentGateway: formData.selectedPaymentGateway,
        itemsCount: cart.items.length,
        totalAmount: cart.totalPrice,
      });
      
      // Add customer info
      orderData.append('customerInfo[name]', formData.name);
      orderData.append('customerInfo[email]', formData.email);
      orderData.append('customerInfo[phone]', formData.phone);
      orderData.append('customerInfo[address]', formData.address);
      
      // Add order items
      cart.items.forEach((item, index) => {
        orderData.append(`items[${index}][product]`, item.product._id);
        orderData.append(`items[${index}][quantity]`, item.quantity.toString());
        orderData.append(`items[${index}][price]`, item.price.toString());
        orderData.append(`items[${index}][name]`, item.product.name);
        orderData.append(`items[${index}][code]`, item.product.code);
      });
      
      // Add payment details
      orderData.append('paymentMethod', formData.paymentMethod);
      
      // Only send selectedPaymentGateway if not COD
      if (formData.paymentMethod !== 'cod' && formData.selectedPaymentGateway) {
        orderData.append('selectedPaymentGateway', formData.selectedPaymentGateway);
      }
      
      orderData.append('totalAmount', cart.totalPrice.toString());
      
      if (formData.paymentMethod === 'half-payment') {
        const halfAmount = cart.totalPrice / 2;
        orderData.append('halfPaymentAmount', halfAmount.toString());
      }
      
      if (formData.notes) {
        orderData.append('notes', formData.notes);
      }
      
      // Add payment screenshot if provided
      if (paymentScreenshot) {
        orderData.append('paymentScreenshot', paymentScreenshot);
      }

      const response = await api.post('/orders', orderData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Order placed successfully!');
      
      // Clear cart
      await clearCart();
      
      // Redirect to order confirmation or dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return <Loading fullScreen />;
  }

  const halfPaymentAmount = cart.totalPrice / 2;
  const selectedPaymentGatewayInfo = paymentMethods.find(m => m.id === formData.selectedPaymentGateway);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Customer Information & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Information</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiUser className="inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiMail className="inline mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiPhone className="inline mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiMapPin className="inline mr-2" />
                      Delivery Address *
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  <FiCreditCard className="inline mr-2" />
                  Payment Method
                </h2>
                
                <div className="space-y-4 mb-6">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="half-payment"
                      checked={formData.paymentMethod === 'half-payment'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Half Payment</div>
                      <div className="text-sm text-gray-600">
                        Pay 50% now (Rs. {halfPaymentAmount.toFixed(2)}), remaining on delivery
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="full-payment"
                      checked={formData.paymentMethod === 'full-payment'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Full Payment</div>
                      <div className="text-sm text-gray-600">
                        Pay full amount now (Rs. {cart.totalPrice.toFixed(2)})
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Cash on Delivery</div>
                      <div className="text-sm text-gray-600">
                        Pay when you receive your order
                      </div>
                    </div>
                  </label>
                </div>

                {/* Payment Gateway Selection */}
                {formData.paymentMethod !== 'cod' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Select Payment Gateway</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {paymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            formData.selectedPaymentGateway === method.id
                              ? 'border-indigo-600 bg-indigo-50'
                              : 'border-gray-300 hover:border-indigo-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentGateway"
                            value={method.id}
                            checked={formData.selectedPaymentGateway === method.id}
                            onChange={(e) => setFormData({ ...formData, selectedPaymentGateway: e.target.value })}
                            className="hidden"
                          />
                          <div className="text-center">
                            <div className="font-semibold text-gray-900 mb-1">{method.name}</div>
                            <div className="text-xs text-gray-600">{method.details.split('\\n')[0]}</div>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* QR Code Display */}
                    {selectedPaymentGatewayInfo && (
                      <div className="mt-6 bg-gray-50 rounded-lg p-6">
                        <div className="text-center">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            {selectedPaymentGatewayInfo.name} Payment
                          </h4>
                          
                          <div className="bg-white p-4 rounded-lg inline-block mb-4">
                            <img
                              src={selectedPaymentGatewayInfo.qrCode}
                              alt={`${selectedPaymentGatewayInfo.name} QR Code`}
                              className="w-64 h-64 object-contain mx-auto"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5RUiBDb2RlPC90ZXh0Pjwvc3ZnPg==';
                              }}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => downloadQRCode(formData.selectedPaymentGateway)}
                            className="flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            <FiDownload />
                            <span>Download QR Code</span>
                          </button>

                          <div className="mt-4 text-sm text-gray-700 whitespace-pre-line">
                            {selectedPaymentGatewayInfo.details}
                          </div>

                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              <strong>Amount to Pay:</strong>{' '}
                              {formData.paymentMethod === 'half-payment'
                                ? `Rs. ${halfPaymentAmount.toFixed(2)} (50%)`
                                : `Rs. ${cart.totalPrice.toFixed(2)} (Full)`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Screenshot Upload */}
                {formData.paymentMethod !== 'cod' && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FiUpload className="inline mr-2" />
                      Upload Payment Screenshot *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {screenshotPreview ? (
                        <div className="space-y-4">
                          <img
                            src={screenshotPreview}
                            alt="Payment screenshot"
                            className="max-h-64 mx-auto rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentScreenshot(null);
                              setScreenshotPreview('');
                            }}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Click to upload payment screenshot
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 5MB
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Notes (Optional)</h2>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special instructions for your order..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Order Items */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <img
                        src={getImageUrl(item.product.images[0]?.url) || PLACEHOLDER_PRODUCT_IMAGE}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = PLACEHOLDER_PRODUCT_IMAGE;
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-indigo-600">
                          Rs. {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">Rs. {cart.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-medium">Calculated later</span>
                  </div>
                  {formData.paymentMethod === 'half-payment' && (
                    <div className="flex justify-between text-blue-600">
                      <span>Pay Now (50%)</span>
                      <span className="font-bold">Rs. {halfPaymentAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>Rs. {cart.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 flex items-center justify-center space-x-2 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  <FiCheck />
                  <span>{loading ? 'Placing Order...' : 'Place Order'}</span>
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing your order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
