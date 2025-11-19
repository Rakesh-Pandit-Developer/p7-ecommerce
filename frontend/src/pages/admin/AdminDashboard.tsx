import React, { useState, useEffect } from 'react';
import { FiPackage, FiShoppingBag, FiUsers, FiDollarSign, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import api from '../../utils/api';
import Loading from '../../components/ui/Loading';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
}

interface TopProduct {
  _id: string;
  name: string;
  sales: number;
  revenue: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch actual data from available endpoints
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        api.get('/products?limit=1000'),
        api.get('/orders?limit=1000'),
        api.get('/users'),
      ]);
      
      const products = productsRes.data.data || [];
      const orders = ordersRes.data.data || [];
      const users = usersRes.data.data || [];
      
      // Calculate stats
      const totalProducts = products.length;
      const totalOrders = orders.length;
      const totalUsers = users.length;
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
      const pendingOrders = orders.filter((order: any) => order.status === 'pending').length;
      const lowStockProducts = products.filter((product: any) => product.stock <= 10).length;
      
      setStats({
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        pendingOrders,
        lowStockProducts,
      });
      
      // Calculate top products from orders
      const productSales: any = {};
      orders.forEach((order: any) => {
        order.items?.forEach((item: any) => {
          if (!productSales[item.product]) {
            productSales[item.product] = {
              _id: item.product,
              name: item.name,
              sales: 0,
              revenue: 0,
            };
          }
          productSales[item.product].sales += item.quantity;
          productSales[item.product].revenue += item.price * item.quantity;
        });
      });
      
      const topProductsList = Object.values(productSales)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5);
      
      setTopProducts(topProductsList as TopProduct[]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: FiPackage,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: FiShoppingBag,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FiUsers,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: FiDollarSign,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: FiTrendingUp,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
    },
    {
      title: 'Low Stock Alert',
      value: stats.lowStockProducts,
      icon: FiAlertCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
    },
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-2">{card.title}</p>
                <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
              </div>
              <div className={`${card.color} p-4 rounded-full`}>
                <card.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">Top Selling Products</h3>
        </div>
        {topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Sales Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.sales}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ${product.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <p>No sales data available yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
