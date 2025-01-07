import React, { useEffect, useState, useCallback } from 'react';
import { AdminService } from '../services/AdminService';
import { toast } from 'react-toastify';
import { FaUserSlash, FaStore } from 'react-icons/fa';

const SellerManagement = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSellers = useCallback(async () => {
    try {
      const data = await AdminService.getSellers();
      setSellers(data);
    } catch (error) {
      toast.error('Failed to fetch sellers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const handleDisableSeller = async (sellerId) => {
    try {
      await AdminService.disableSeller(sellerId);
      toast.success('Seller account disabled successfully');
      fetchSellers(); // Refresh the list
    } catch (error) {
      toast.error('Failed to disable seller');
    }
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Seller Management</h1>
          <p className="mt-2 text-gray-400">Manage and monitor seller accounts</p>
        </div>

        {/* Sellers List */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Shop Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sellers.map((seller) => (
                  <tr key={seller._id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={seller.shopAvatar || '/default-shop.png'}
                            alt={seller.shopName}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {seller.shopName}
                          </div>
                          <div className="text-sm text-gray-400">
                            {seller.shopDescription}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">{seller.name}</div>
                      <div className="text-sm text-gray-400">{seller.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-400">{seller.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDisableSeller(seller._id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <FaUserSlash className="mr-2" />
                        Disable Seller
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {sellers.length === 0 && (
          <div className="text-center py-12">
            <FaStore className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-400">No sellers found</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerManagement;