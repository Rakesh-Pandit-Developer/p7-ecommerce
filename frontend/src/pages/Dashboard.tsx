import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiDollarSign, FiShoppingBag, FiPackage, FiClock, FiSettings, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import Loading from '../components/ui/Loading';

interface Order {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  orderStatus: string;
  items: {
    product: any;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }[];
  createdAt: string;
  deliveredAt?: string;
  halfPaymentAmount?: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      const userOrders = response.data.data || [];
      setOrders(userOrders);

      // Calculate stats
      const totalSpent = userOrders.reduce((sum: number, order: Order) => {
        if (order.paymentStatus === 'paid' || order.paymentStatus === 'half-paid') {
          return sum + order.totalAmount;
        }
        return sum;
      }, 0);

      const pendingOrders = userOrders.filter((order: Order) => 
        order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled'
      ).length;

      const completedOrders = userOrders.filter((order: Order) => 
        order.orderStatus === 'delivered'
      ).length;

      setStats({
        totalSpent,
        totalOrders: userOrders.length,
        pendingOrders,
        completedOrders,
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentInfo = (order: Order) => {
    const total = order.totalAmount;
    let paid = 0;
    let remaining = total;

    if (order.paymentStatus === 'paid') {
      paid = total;
      remaining = 0;
    } else if (order.paymentStatus === 'half-paid' && order.halfPaymentAmount) {
      paid = order.halfPaymentAmount;
      remaining = total - paid;
    }

    return { paid, remaining, total };
  };

  const getDeliveryTime = (order: Order) => {
    const createdAt = new Date(order.createdAt);
    const now = new Date();
    const diffTime = now.getTime() - createdAt.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (order.orderStatus === 'delivered') {
      return 'Delivered';
    }

    return `${diffDays}d ${diffHours}h since order`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      'half-paid': 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <FiUser className="h-8 w-8 text-indigo-600" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard/settings"
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <FiSettings />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">Rs. {stats.totalSpent.toFixed(2)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FiDollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FiPackage className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FiPackage className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Your Orders</h2>
          </div>
          
          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">No orders yet</p>
              <Link
                to="/shop"
                className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {orders.map((order) => {
                const paymentInfo = getPaymentInfo(order);
                return (
                  <div key={order._id} className="p-6 hover:bg-gray-50">
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiClock className="text-gray-400" />
                        <span className="text-sm text-gray-600">{getDeliveryTime(order)}</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center space-x-3 text-sm">
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-900">{item.name}</span>
                            <span className="text-gray-500">x{item.quantity}</span>
                            <span className="text-gray-900 font-medium">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment & Status Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                        <p className="text-lg font-bold text-gray-900">Rs. {paymentInfo.total.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Paid</p>
                        <p className="text-lg font-bold text-green-600">Rs. {paymentInfo.paid.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Remaining</p>
                        <p className="text-lg font-bold text-orange-600">Rs. {paymentInfo.remaining.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        Payment: {order.paymentStatus === 'half-paid' ? 'Half Paid' : order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {order.paymentMethod === 'half-payment' ? 'Half Payment' : order.paymentMethod === 'full-payment' ? 'Full Payment' : 'COD'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;