import { useState, useEffect } from 'react';
import { UserService } from '../services/UserService';
import NavigationBar from './NavigationBar';
import { toast } from 'react-toastify';

const MyOrder = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await UserService.getMyOrders();
            console.log('Orders received:', data);
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
            console.log('Timestamp received:', timestamp);
            
            if (!timestamp) {
                console.log('No timestamp provided');
                return 'Date not available';
            }
    
            const milliseconds = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp;
            console.log('Milliseconds:', milliseconds);
            
            const date = new Date(milliseconds);
            console.log('Created date object:', date);
            
            if (isNaN(date.getTime())) {
                console.log('Invalid date created');
                return 'Date not available';
            }
    
            const formattedDate = new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).format(date);
            
            console.log('Formatted date:', formattedDate);
            return formattedDate;
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Date not available';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 0: // Processing
                return 'bg-blue-100 text-blue-800';
            case 1: // Shipped
                return 'bg-purple-100 text-purple-800';
            case 2: // Delivered
                return 'bg-green-100 text-green-800';
            case 3: // Cancelled
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 0:
                return 'Processing';
            case 1:
                return 'Shipped';
            case 2:
                return 'Delivered';
            case 3:
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    };

    if (loading) return (
        <>
            <NavigationBar />
            <div className="container mx-auto p-4">
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        </>
    );

    if (error) return (
        <>
            <NavigationBar />
            <div className="container mx-auto p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        </>
    );

    return (
        <>
            <NavigationBar />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6">My Orders</h1>
                
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
                                            Placed on: {formatDate(order.orderedAt)}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                        {getStatusText(order.status)}
                                    </span>
                                </div>

                                {/* Order Items */}
                                <div className="border-t border-b py-4 mb-4">
                                    {order.products.map((item) => (
                                        <div key={item._id} className="flex items-center py-2">
                                            <img
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                            <div className="ml-4 flex-1">
                                                <h3 className="font-medium">{item.product.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    Quantity: {item.quantity}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Price: ${(item.product.finalPrice || item.product.price).toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">
                                                    ${((item.product.finalPrice || item.product.price) * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Footer */}
                                <div className="flex justify-between items-start">
                                    <div className="text-sm">
                                        <p className="font-medium">Delivery Address:</p>
                                        <p className="text-gray-600">{order.address}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Total Amount</p>
                                        <p className="text-xl font-bold">${order.totalPrice.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default MyOrder;