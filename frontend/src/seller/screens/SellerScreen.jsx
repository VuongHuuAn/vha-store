import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProductScreen from './ProductScreen';
import OrderScreen from './OrderScreen';

import DashboardScreen from './DashboardScreen';

export default function SellerScreen() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState('dashboard');
    const [openAddProduct, setOpenAddProduct] = useState(false);

    console.log("SellerScreen - Current user:", user);
    
    const handleLogout = async () => {
        console.log("SellerScreen: Handling logout");
        await logout();
        navigate('/login', { replace: true }); 
    };

    // Kiểm tra quyền truy cập
    if (!user || user.type !== 'seller') {
        console.log("SellerScreen - Access denied, redirecting to home");
        return <Navigate to="/" replace />;
    }

    const renderContent = () => {
        switch (selectedTab) {
            case 'dashboard':
                return <DashboardScreen />;
            case 'products':
                return <ProductScreen openDialog={openAddProduct} setOpenDialog={setOpenAddProduct} />;
            case 'orders':
                return <OrderScreen />;
           
            default:
                return <DashboardScreen />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">Seller Dashboard</h2>
                </div>
                <nav className="mt-6">
                    <div className="px-4 space-y-2">
                        <button
                            onClick={() => setSelectedTab('dashboard')}
                            className={`w-full flex items-center p-3 rounded-lg ${
                                selectedTab === 'dashboard' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                            }`}
                        >
                            📊 Dashboard
                        </button>
                        <button
                            onClick={() => setSelectedTab('products')}
                            className={`w-full flex items-center p-3 rounded-lg ${
                                selectedTab === 'products' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                            }`}
                        >
                            📦 Products
                        </button>
                        <button
                            onClick={() => setSelectedTab('orders')}
                            className={`w-full flex items-center p-3 rounded-lg ${
                                selectedTab === 'orders' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
                            }`}
                        >
                            🛍️ Orders
                        </button>
                        
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm">
                    <div className="px-8 py-4 flex items-center justify-between">
                        <h1 className="text-2xl font-semibold">
                            {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
                        </h1>
                        <div className="flex items-center space-x-4">
                           
                            <button className="p-2 rounded-full hover:bg-gray-100">
                                🔔
                            </button>
                            <div className="relative">
                                <button 
                                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
                                    onClick={handleLogout}
                                >
                                    <span>👤</span>
                                    <span className="text-red-500">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}