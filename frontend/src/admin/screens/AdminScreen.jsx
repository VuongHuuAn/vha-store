import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaUserCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { AdminService } from '../services/AdminService';
import { toast } from 'react-toastify';

const AdminScreen = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSellers: 0,
    pendingRequests: 0,
    activeSellers: 0,
    blockedSellers: 0
  });
  const [loading, setLoading] = useState(true);

  // Tối ưu fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await AdminService.getSellerStats();
      setStats({
        totalSellers: data.totalSellers || 0,
        pendingRequests: data.pendingRequests || 0,
        activeSellers: data.activeSellers || 0,
        blockedSellers: data.blockedSellers || 0
      });
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Cache menu items
  const menuItems = useMemo(() => [
    {
      title: 'Seller Management',
      description: 'Manage seller accounts and permissions',
      icon: <FaUsers className="w-8 h-8" />,
      path: '/admin/seller-management',
      stats: {
        total: stats.totalSellers,
        label: 'Total Sellers',
        color: 'text-blue-400'
      }
    },
    {
      title: 'Seller Requests',
      description: 'Review and manage seller applications',
      icon: <FaUserCog className="w-8 h-8" />,
      path: '/admin/requests',
      stats: {
        total: stats.pendingRequests,
        label: 'Pending Requests',
        color: 'text-yellow-400'
      }
    }
  ], [stats.totalSellers, stats.pendingRequests]);

  // Cache logout handler
  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="mt-2 text-gray-400">Welcome back, {user?.name || 'Admin'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item, index) => (
            <div 
              key={index} 
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => navigate(item.path)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-blue-400">
                  {item.icon}
                </div>
                <div className="bg-gray-900 rounded-full px-4 py-1">
                  <span className="text-sm text-gray-400">{item.stats.label}</span>
                  <span className={`ml-2 font-bold ${item.stats.color}`}>
                    {item.stats.total}
                  </span>
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-white mb-2">
                {item.title}
              </h2>
              <p className="text-gray-400 text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Sellers</p>
              <p className="text-2xl font-bold text-white">{stats.totalSellers}</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Pending Requests</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.pendingRequests}</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Active Sellers</p>
              <p className="text-2xl font-bold text-green-500">{stats.activeSellers}</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Blocked Sellers</p>
              <p className="text-2xl font-bold text-red-500">{stats.blockedSellers}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminScreen;