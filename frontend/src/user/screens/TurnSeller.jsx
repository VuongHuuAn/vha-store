import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import NavigationBar from './NavigationBar';
import { SellerService } from '../../seller/services/SellerService';

const TurnSeller = () => {
  const [formData, setFormData] = useState({
    shopName: '',
    shopDescription: '',
    address: '',
    avatarUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('none');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    checkRequestStatus();
  }, []);

  const checkRequestStatus = async () => {
    try {
      const response = await SellerService.getSellerRequestStatus();
      setStatus(response.status);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Upload avatar image first
      const avatarUrl = await SellerService.uploadImage(selectedFile, 'shop-avatars');

      // Submit seller request
      await SellerService.registerAsSeller({
        ...formData,
        avatarUrl
      });

      toast.success('Seller request submitted successfully!');
      setStatus('pending');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStatusMessage = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
            Your seller request is pending approval. Please wait for admin review.
          </div>
        );
      case 'approved':
        return (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
            Your seller request has been approved! You can now access the seller dashboard.
          </div>
        );
      case 'rejected':
        return (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            Your seller request was rejected. You may submit a new request.
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Become a Seller</h1>
          
          {renderStatusMessage()}

          {(status === 'none' || status === 'rejected') && (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
              {/* Shop Avatar */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Shop Avatar</label>
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-gray-400">No image</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>
              </div>

              {/* Shop Name */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Shop Name</label>
                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your shop name"
                />
              </div>

              {/* Shop Description */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Shop Description</label>
                <textarea
                  name="shopDescription"
                  value={formData.shopDescription}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your shop"
                />
              </div>

              {/* Address */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your shop address"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TurnSeller;