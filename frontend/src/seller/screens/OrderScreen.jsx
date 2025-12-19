import { useState, useEffect } from 'react';
import { SellerService } from '../services/SellerService';
import { toast } from 'react-toastify';

const OrderScreen = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedStatus, setSelectedStatus] = useState({});

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await SellerService.getOrders();
            setOrders(data);
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        try {
            if (!timestamp) return 'Date not available';
            const date = new Date(timestamp);
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch {
            return 'Date not available';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 0: return 'Processing';
            case 1: return 'Shipped';
            case 2: return 'Delivered';
            case 3: return 'Cancelled';
            default: return 'Unknown';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 0: return 'bg-blue-100 text-blue-800';
            case 1: return 'bg-yellow-100 text-yellow-800';
            case 2: return 'bg-green-100 text-green-800';
            case 3: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await SellerService.changeOrderStatus(orderId, newStatus);
            toast.success('Order status updated successfully');
            fetchOrders(); // Refresh orders list
            setSelectedStatus(prev => {
                const updated = { ...prev };
                delete updated[orderId];
                return updated;
            });
        } catch (err) {
            toast.error(err.message);
        }
    };

    const getStatusButtons = (order) => {
        const currentStatus = selectedStatus[order._id] || order.status;
        
        return (
            <div className="flex space-x-2">
                <button
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                        currentStatus === 0 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedStatus({
                        ...selectedStatus,
                        [order._id]: 0
                    })}
                >
                    Processing
                </button>
                <button
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                        currentStatus === 1 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedStatus({
                        ...selectedStatus,
                        [order._id]: 1
                    })}
                >
                    Shipped
                </button>
                <button
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                        currentStatus === 2 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedStatus({
                        ...selectedStatus,
                        [order._id]: 2
                    })}
                >
                    Delivered
                </button>
                <button
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                        currentStatus === 3 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedStatus({
                        ...selectedStatus,
                        [order._id]: 3
                    })}
                >
                    Cancelled
                </button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Order Management</h1>
            
            {orders.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No orders found</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-lg shadow-sm p-6">
                            {/* Order Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Order ID: {order._id}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Ordered at: {formatDate(order.orderedAt)}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                    {getStatusText(order.status)}
                                </span>
                            </div>

                            {/* Order Items */}
                            <div className="border-t border-b py-4 mb-4">
                                {order.products.map((item, index) => {
                                    const itemPrice = item.product.finalPrice || item.product.price;
                                    const itemTotal = itemPrice * item.quantity;
                                    
                                    return (
                                        <div key={index} className="flex items-center py-4 border-b last:border-b-0">
                                            <img
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                            <div className="ml-4 flex-1">
                                                <h3 className="font-medium">{item.product.name}</h3>
                                                <div className="flex items-center space-x-4 mt-2">
                                                    <p className="text-sm text-gray-500">
                                                        Quantity: {item.quantity}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Price: ${itemPrice.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">
                                                    ${itemTotal.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Order Footer with Status Controls */}
                            <div className="flex flex-col space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="text-sm">
                                        <p className="font-medium">Delivery Address:</p>
                                        <p className="text-gray-600">{order.address}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Total Amount</p>
                                        <p className="text-xl font-bold">
                                            ${order.products.reduce((total, item) => {
                                                const itemPrice = item.product.finalPrice || item.product.price;
                                                return total + (itemPrice * item.quantity);
                                            }, 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Status Controls */}
                                <div className="border-t pt-4">
                                    <div className="flex flex-col space-y-3">
                                        <p className="text-sm font-medium">Update Order Status:</p>
                                        {getStatusButtons(order)}
                                        {selectedStatus[order._id] !== undefined && 
                                        selectedStatus[order._id] !== order.status && (
                                            <button
                                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors w-full mt-2"
                                                onClick={() => handleStatusChange(order._id, selectedStatus[order._id])}
                                            >
                                                Update Status
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderScreen; 