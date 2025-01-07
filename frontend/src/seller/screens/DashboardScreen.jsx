import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { SellerService } from '../services/SellerService';

// Đăng ký các components cần thiết cho Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

const DashboardScreen = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const data = await SellerService.getAnalytics();
            setAnalyticsData(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    // Cấu hình cho biểu đồ doanh thu
    const getRevenueChartData = () => ({
        labels: analyticsData?.sales.map(item => item.category) || [],
        datasets: [
            {
                data: analyticsData?.sales.map(item => item.earning) || [],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ],
                borderColor: '#fff',
                borderWidth: 2,
            },
        ],
    });

    // Cấu hình cho biểu đồ số lượng
    const getQuantityChartData = () => ({
        labels: analyticsData?.sales.map(item => item.category) || [],
        datasets: [
            {
                data: analyticsData?.sales.map(item => item.quantity) || [],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ],
                borderColor: '#fff',
                borderWidth: 2,
            },
        ],
    });

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
        },
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Total Sales</h3>
                    <p className="text-2xl font-semibold mt-2">
                        ${analyticsData?.totalEarnings?.toFixed(2) || '0.00'}
                    </p>
                    <span className="text-green-500 text-sm">Total Earnings</span>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Total Categories</h3>
                    <p className="text-2xl font-semibold mt-2">
                        {analyticsData?.sales?.length || 0}
                    </p>
                    <span className="text-blue-500 text-sm">Active Categories</span>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">Total Products Sold</h3>
                    <p className="text-2xl font-semibold mt-2">
                        {analyticsData?.sales?.reduce((acc, curr) => acc + curr.quantity, 0) || 0}
                    </p>
                    <span className="text-blue-500 text-sm">Units Sold</span>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Revenue by Category</h3>
                    <div className="h-[300px] flex justify-center">
                        <Pie data={getRevenueChartData()} options={chartOptions} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Quantity by Category</h3>
                    <div className="h-[300px] flex justify-center">
                        <Pie data={getQuantityChartData()} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* Detailed Stats Table */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Detailed Statistics</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Revenue
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity Sold
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {analyticsData?.sales.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.category}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        ${item.earning.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.quantity}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardScreen;