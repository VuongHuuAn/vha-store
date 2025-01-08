import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserService } from '../services/UserService';
import NavigationBar from './NavigationBar';
import { toast } from 'react-toastify';
import PriceDisplay from './PriceDisplay';

const Category = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Định nghĩa categories
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'Mobiles', name: 'Mobiles' },     // Chữ cái đầu viết hoa
    { id: 'Essentials', name: 'Essentials' },
    { id: 'Appliances', name: 'Appliances' },
    { id: 'Books', name: 'Books' },
    { id: 'Fashion', name: 'Fashion' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const categoryParam = !category || category === 'all' ? null : 
      categories.find(cat => cat.id.toLowerCase() === category.toLowerCase())?.id;
      const data = await UserService.getProducts(categoryParam);
      setProducts(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchProducts();
      return;
    }
    try {
      setLoading(true);
      const data = await UserService.searchProducts(searchTerm);
      setProducts(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    

    <div className="min-h-screen bg-gray-50">
    <NavigationBar />
    
    <div className="container mx-auto px-4 py-8">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(`/category/${cat.id === 'all' ? '' : cat.id}`)}
            className={`px-4 py-2 rounded-full ${
              (category === cat.id || (!category && cat.id === 'all'))
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="p-2 border rounded-lg w-64"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Search
        </button>
      </div>

      {/* Products Count */}
      <div className="text-gray-600 mb-4">
        Showing {products.length} products
      </div>
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        
      {/* Products Grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
         {products.map((product) => (
  <div
    key={product._id}
    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="relative overflow-hidden">
  <img
    src={product.images[0]}
    alt={product.name}
    className="w-full h-48 object-cover rounded-t-lg hover:scale-105 transition-transform duration-300"
  />
  <PriceDisplay 
    price={product.price}
    finalPrice={product.finalPrice}
    discount={product.discount}
    showSaleTag={true}
    showEndDate={true}
    endDate={product.endDate}
  />
</div>
<div className="p-4">
  <h3 className="font-semibold text-gray-800 mb-2 truncate">
    {product.name}
  </h3>
  {product.sellerId?.shopName && (
    <div className="flex items-center space-x-2 mb-3">
      <img 
        src={product.sellerId.shopAvatar || '/default-shop.png'} 
        alt={product.sellerId.shopName}
        className="w-4 h-4 rounded-full object-cover"
      />
      <span className="text-xs text-gray-500">
        {product.sellerId.shopName}
      </span>
    </div>
  )}
  <div className="flex justify-between items-center">
    <PriceDisplay 
      price={product.price}
      finalPrice={product.finalPrice}
      discount={product.discount}
      showStars={true}
      rating={product.avgRating}
    />
    <button
      onClick={() => navigate(`/product/${product._id}`)}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      View Details
    </button>
  </div>
</div>
  </div>
))}
 
        </div>
      )}

        {/* No Products Found */}
        {!loading && products.length === 0 && (
          <div className="text-center py-8">
            No products found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;