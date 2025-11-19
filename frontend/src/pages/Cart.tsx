import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import { getImageUrl } from '../utils/api';
import { PLACEHOLDER_PRODUCT_IMAGE } from '../utils/placeholder';

const Cart: React.FC = () => {
  const { cart, loading, updateCartItem, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();

  const handleWhatsAppOrder = () => {
    if (!cart || cart.items.length === 0) return;

    // Build product list
    let message = `🛒 *Cart Order Request*\n\n`;
    message += `📦 *Products:*\n`;
    
    cart.items.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}\n`;
      message += `   Code: ${item.product.code}\n`;
      message += `   Price: Rs. ${item.price.toFixed(2)}\n`;
      message += `   Quantity: ${item.quantity}\n`;
      message += `   Subtotal: Rs. ${(item.price * item.quantity).toFixed(2)}\n\n`;
    });

    message += `💰 *Total Amount: Rs. ${cart.totalPrice.toFixed(2)}*\n`;
    message += `📦 *Total Items: ${cart.totalItems}*\n\n`;

    // Add user info if available
    if (user) {
      message += `👤 *Customer Information:*\n`;
      message += `Name: ${user.name}\n`;
      message += `Email: ${user.email}\n`;
      if (user.phone) {
        message += `Phone: ${user.phone}\n`;
      }
      if (user.address) {
        message += `Address: ${user.address}\n`;
      }
    }

    const url = `https://wa.me/9779806812433?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <Link to="/shop">
            <Button variant="primary">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {cart.items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-4 p-6 border-b last:border-b-0"
                >
                  {/* Product Image */}
                  <img
                    src={getImageUrl(item.product.images[0]?.url) || PLACEHOLDER_PRODUCT_IMAGE}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = PLACEHOLDER_PRODUCT_IMAGE;
                    }}
                  />

                  {/* Product Info */}
                  <div className="flex-1">
                    <Link
                      to={`/product/${item.product._id}`}
                      className="font-semibold text-gray-900 hover:text-indigo-600 block mb-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-gray-600 mb-2">Code: {item.product.code}</p>
                    <p className="text-lg font-bold text-indigo-600">
                      Rs. {item.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateCartItem(item._id, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-50"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateCartItem(item._id, Math.min(item.product.stock, item.quantity + 1))}
                      className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-50"
                      disabled={item.quantity >= item.product.stock}
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal & Remove */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 mb-2">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-600 hover:text-red-700"
                      aria-label="Remove item"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.totalItems} items)</span>
                  <span className="font-medium">Rs. {cart.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>Rs. {cart.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Link to="/checkout">
                <Button variant="primary" fullWidth size="lg">
                  Proceed to Checkout
                </Button>
              </Link>

              <button
                onClick={handleWhatsAppOrder}
                className="w-full mt-3 flex items-center justify-center gap-2 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                <FaWhatsapp size={20} />
                Order via WhatsApp
              </button>

              <Link to="/shop">
                <Button variant="outline" fullWidth className="mt-3">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
