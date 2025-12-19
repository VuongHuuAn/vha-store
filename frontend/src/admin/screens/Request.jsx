import { useState, useEffect } from 'react';
import { AdminService } from '../services/AdminService';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const Request = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const requestsData = await AdminService.getSellerRequests();
      setRequests(requestsData);
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (requestId, status) => {
    try {
      await AdminService.processSellerRequest(requestId, status);
      toast.success(`Request ${status} successfully`);
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.msg || `Failed to ${status} request`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Seller Requests</h1>
            <p className="mt-2 text-gray-400">Review and manage seller applications</p>
          </div>
          <div className="flex space-x-4">
            <div className="bg-gray-800 rounded-lg px-4 py-2">
              <span className="text-gray-400">Total Requests: </span>
              <span className="text-blue-400 font-bold">{requests.length}</span>
            </div>
            <div className="bg-gray-800 rounded-lg px-4 py-2">
              <span className="text-gray-400">Pending: </span>
              <span className="text-yellow-400 font-bold">
                {requests.filter(r => r.status === 'pending').length}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {requests.map((request) => (
            <div key={request._id} className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between">
                  <div className="flex space-x-6">
                    {/* Shop Avatar */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-700">
                      <img
                        src={request.avatarUrl}
                        alt={request.shopName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(request.shopName)}&size=96&background=random`;
                        }}
                      />
                    </div>

                    {/* Shop Info */}
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-2xl font-bold text-white">{request.shopName}</h3>
                        <span className={`px-3 py-1 text-sm rounded-full ${
                          request.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                          request.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-gray-400">Owner: {request.userId.name}</p>
                        <p className="text-gray-400">Email: {request.userId.email}</p>
                        <div className="flex items-center text-gray-400">
                          <FaMapMarkerAlt className="mr-2" />
                          {request.address}
                        </div>
                        <div className="flex items-center text-gray-400">
                          <FaClock className="mr-2" />
                          {formatDate(request.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {request.status === 'pending' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleProcessRequest(request._id, 'approved')}
                        className="flex items-center px-4 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
                      >
                        <FaCheck className="mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleProcessRequest(request._id, 'rejected')}
                        className="flex items-center px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <FaTimes className="mr-2" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>

                {/* Shop Description */}
                <div className="mt-6 bg-gray-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Shop Description</h4>
                  <p className="text-white">{request.shopDescription}</p>
                </div>
              </div>
            </div>
          ))}

          {requests.length === 0 && (
            <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
              No seller requests found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Request;