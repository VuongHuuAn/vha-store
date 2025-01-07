import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../services/UserService';
import NavigationBar from './NavigationBar';
import { toast } from 'react-toastify';
import GooglePayButton from '@google-pay/button-react';

const Order = () => {
    const [cart, setCart] = useState([]);
    const [address, setAddress] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPayment, setSelectedPayment] = useState('cash'); // 'cash' or 'googlepay'
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const cartData = await UserService.getCart();
            if (cartData) {
                setCart(cartData);
                calculateTotal(cartData);
            }
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = (cartItems) => {
        const total = cartItems.reduce((sum, item) => {
            return sum + ((item.product.finalPrice || item.product.price) * item.quantity);
        }, 0);
        setTotalPrice(total);
    };

    const handleAddressChange = (e) => {
        setAddress(e.target.value);
    };

    const handleSaveAddress = async () => {
        try {
            if (!address.trim()) {
                toast.error('Please enter a delivery address');
                return;
            }
            await UserService.saveUserAddress(address);
            toast.success('Delivery address saved successfully');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handlePlaceOrder = async () => {
        try {
            if (!address.trim()) {
                toast.error('Please enter a delivery address');
                return;
            }
    
            // Group cart items by sellerId
            const ordersBySeller = cart.reduce((acc, item) => {
                const sellerId = item.product.sellerId._id;
                if (!acc[sellerId]) {
                    acc[sellerId] = {
                        items: [],
                        totalPrice: 0
                    };
                }
                acc[sellerId].items.push(item);
                acc[sellerId].totalPrice += (item.product.finalPrice || item.product.price) * item.quantity;
                return acc;
            }, {});
    
            // Place order for each seller
            for (const sellerId in ordersBySeller) {
                await UserService.placeOrder(
                    ordersBySeller[sellerId].items,
                    ordersBySeller[sellerId].totalPrice,
                    address
                );
            }
    
            toast.success('Orders placed successfully!');
            navigate('/');
        } catch (err) {
            toast.error(err.message);
        }
    };
    
    const handleGooglePaySuccess = async (paymentData) => {
        try {
            console.log('Google Pay payment successful', paymentData);
            if (!address.trim()) {
                toast.error('Please enter a delivery address');
                return;
            }
    
            // Group cart items by sellerId
            const ordersBySeller = cart.reduce((acc, item) => {
                const sellerId = item.product.sellerId._id;
                if (!acc[sellerId]) {
                    acc[sellerId] = {
                        items: [],
                        totalPrice: 0
                    };
                }
                acc[sellerId].items.push(item);
                acc[sellerId].totalPrice += (item.product.finalPrice || item.product.price) * item.quantity;
                return acc;
            }, {});
    
            // Place order for each seller
            for (const sellerId in ordersBySeller) {
                await UserService.placeOrder(
                    ordersBySeller[sellerId].items,
                    ordersBySeller[sellerId].totalPrice,
                    address
                );
            }
    
            toast.success('Orders placed successfully with Google Pay!');
            navigate('/');
        } catch (err) {
            toast.error(err.message);
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
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Checkout</h1>
                    <p className="text-gray-600">Complete your order</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Delivery Address */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
                            <textarea
                                value={address}
                                onChange={handleAddressChange}
                                className="w-full p-3 border rounded-lg mb-4 min-h-[100px]"
                                placeholder="Enter your delivery address"
                            />
                            <button
                                onClick={handleSaveAddress}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Save Address
                            </button>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <div key={item.product._id} 
                                         className="flex items-center border-b last:border-0 pb-4 last:pb-0">
                                        <img
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            className="w-20 h-20 object-cover rounded"
                                        />
                                        <div className="ml-4 flex-1">
                                            <h3 className="font-semibold">{item.product.name}</h3>
                                            <p className="text-gray-600">Quantity: {item.quantity}</p>
                                            <p className="text-gray-600">
                                                Price: ${(item.product.finalPrice || item.product.price).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="font-bold">
                                            ${((item.product.finalPrice || item.product.price) * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                            <div className="space-y-3">
                                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cash"
                                        checked={selectedPayment === 'cash'}
                                        onChange={(e) => setSelectedPayment(e.target.value)}
                                        className="form-radio h-5 w-5 text-blue-600"
                                    />
                                    <span>Cash on Delivery</span>
                                </label>
                                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="googlepay"
                                        checked={selectedPayment === 'googlepay'}
                                        onChange={(e) => setSelectedPayment(e.target.value)}
                                        className="form-radio h-5 w-5 text-blue-600"
                                    />
                                    <span>Google Pay</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>${totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Buttons */}
                            <div className="mt-6 space-y-4">
                                {selectedPayment === 'googlepay' ? (
                                    <GooglePayButton
                                    environment="TEST"
                                    paymentRequest={{
                                      apiVersion: 2,
                                      apiVersionMinor: 0,
                                      allowedPaymentMethods: [
                                        {
                                          type: 'CARD',
                                          parameters: {
                                            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                                            allowedCardNetworks: ['MASTERCARD', 'VISA'],
                                          },
                                          tokenizationSpecification: {
                                            type: 'PAYMENT_GATEWAY',
                                            parameters: {
                                              gateway: 'example',
                                              gatewayMerchantId: 'exampleGatewayMerchantId',
                                            },
                                          },
                                        },
                                      ],
                                      merchantInfo: {
                                        merchantId: '12345678901234567890',
                                        merchantName: 'Demo Merchant',
                                      },
                                      transactionInfo: {
                                        totalPriceStatus: 'FINAL',
                                        totalPriceLabel: 'Total',
                                        totalPrice: '100.00',
                                        currencyCode: 'USD',
                                        countryCode: 'US',
                                      },
                                    }}
                                    onLoadPaymentData={paymentRequest => {
                                      console.log('load payment data', paymentRequest);
                                    }}
                                  />
                                ) : (
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={!cart.length || !address.trim()}
                                        className={`w-full py-3 rounded-lg text-white
                                            ${(!cart.length || !address.trim())
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700'}`}
                                    >
                                        Place Order with Cash
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Order;