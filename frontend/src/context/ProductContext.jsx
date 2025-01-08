import { createContext, useContext, useState, useEffect } from 'react';
import { UserService } from '../user/services/UserService';

const ProductContext = createContext();

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all products with proper price calculations
  const fetchProducts = async (category) => {
    try {
      setLoading(true);
      setError(null);
      const fetchedProducts = await UserService.getProducts(category);
      
      // Update products with calculated final prices
      const updatedProducts = fetchedProducts.map(product => ({
        ...product,
        finalPrice: calculateFinalPrice(product)
      }));

      setProducts(updatedProducts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate final price based on discount and dates
  const calculateFinalPrice = (product) => {
  if (!product) return null;
  
  const now = new Date();
  const startDate = product.startDate ? new Date(product.startDate) : null;
  const endDate = product.endDate ? new Date(product.endDate) : null;

  // Kiểm tra chi tiết điều kiện giảm giá
  if (
    product.discount > 0 &&
    startDate &&
    endDate &&
    now >= startDate &&
    now <= endDate
  ) {
    return product.price * (1 - product.discount / 100);
  }
  return product.price;
};
  // Get a single product with calculated final price
  const getProductById = async (productId) => {
    try {
      setLoading(true);
      setError(null);
      const product = await UserService.getProductById(productId);
      return {
        ...product,
        finalPrice: calculateFinalPrice(product)
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get deal of the day products with proper pricing
  const getDealOfDay = async () => {
    try {
      setLoading(true);
      setError(null);
      const deals = await UserService.getDealOfDay();
      return deals.map(product => ({
        ...product,
        finalPrice: calculateFinalPrice(product)
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    products,
    loading,
    error,
    fetchProducts,
    getProductById,
    getDealOfDay,
    calculateFinalPrice
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;