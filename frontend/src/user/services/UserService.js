import axios from "axios";
import { URI } from "../../constants/global_variables";
const api = axios.create({
  baseURL:  URI,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers["x-auth-token"] = token;
    return config;
  },
  (error) => Promise.reject(error)
);

export class UserService {
  static async getProducts(category) {
    try {
      const params = category ? { category } : {};
      const response = await api.get("/api/products", { params });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Authentication required. Please login.");
      }
      if (error.response?.status === 404) {
        throw new Error("Products not found for this category.");
      }
      throw this.handleError(error);
    }
  }
  static async getProductById(productId) {
    try {
      const response = await api.get(`/api/products/${productId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  static async searchProducts(searchTerm) {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found");

      const response = await api.get(`/api/products/search/${searchTerm}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Authentication required. Please login.");
      }
      if (error.response?.status === 404) {
        throw new Error("No products found matching your search.");
      }
      throw this.handleError(error);
    }
  }

  static handleError(error) {
    return new Error(
      error.response?.data?.msg ||
        error.response?.data?.error ||
        error.message ||
        "An error occurred"
    );
  }

  static async rateProduct(productId, rating) {
    try {
      const response = await api.post("/api/rate-product", {
        id: productId,
        rating,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getDealOfDay() {
    try {
      const response = await api.get("/api/deal-of-day");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async addComment(
    productId,
    content,
    rating,
    images = [],
    purchaseVerified = false
  ) {
    try {
      const response = await api.post("/api/add-comment", {
        productId,
        content,
        rating,
        images,
        purchaseVerified,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async addReply(commentId, content) {
    try {
      const response = await api.post("/api/add-reply", {
        commentId,
        content,
      });
      return response.data.comment;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getProductComments(productId) {
    try {
      const response = await api.get(`/api/product/comments/${productId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Thêm sản phẩm vào giỏ hàng
  static async addToCart(productId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Please login to add items to cart');
        }

        const response = await api.post(
            "/api/add-to-cart",
            { 
                product: productId,
                productType: 'Product'  // Thêm productType để khớp với model backend
            }
        );

        // Response sẽ trả về user object với cart đã được populate
        const updatedUser = response.data;
        
        // Có thể trả về chỉ phần cart đã populate nếu cần
        return {
            cart: updatedUser.cart,
            user: updatedUser
        };

    } catch (error) {
        console.error('Add to cart error:', error);
        if (error.response?.status === 401) {
            throw new Error('Please login to continue');
        }
        if (error.response?.status === 404) {
            throw new Error('Product not found');
        }
        if (error.response?.status === 500) {
            throw new Error(error.response?.data?.error || 'Server error. Please try again later.');
        }
        throw this.handleError(error);
    }
}

  // Lấy thông tin giỏ hàng
  static async getCart() {
    try {
        const response = await api.get("/api/cart");
        // Kiểm tra và trả về đúng dữ liệu cart
        return response.data.cart || response.data || [];
    } catch (error) {
        if (error.response?.status === 401) {
            throw new Error('Please login to view cart');
        }
        if (error.response?.status === 404) {
            throw new Error('User not found');
        }
        throw this.handleError(error);
    }
}

  // Xóa sản phẩm khỏi giỏ hàng
  static async removeFromCart(productId, removeAll = false) {
    try {
        const response = await api.delete(
            `/api/delete-from-cart/${productId}?removeAll=${removeAll}`
        );

        // Kiểm tra response có đúng cấu trúc từ backend
        if (!response.data) {
            throw new Error('No data received from server');
        }

        const { cart, subtotal, message } = response.data;
        
        // Trả về cấu trúc giống backend
        return {
            cart,
            subtotal,
            message
        };
    } catch (error) {
        if (error.response?.status === 401) {
            throw new Error('Please login to continue');
        }
        if (error.response?.status === 404) {
            throw new Error('Product not found in cart');
        }
        throw this.handleError(error);
    }
}
  // Lưu địa chỉ người dùng
  static async saveUserAddress(address) {
    try {
      const response = await api.post("/api/save-user-address", { address });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Đặt hàng
  static async placeOrder(cart, totalPrice, address) {
    try {
      // Ensure we have all required data
      if (!cart || !Array.isArray(cart) || cart.length === 0) {
        throw new Error('Cart cannot be empty');
      }
      if (!totalPrice || totalPrice <= 0) {
        throw new Error('Invalid total price');
      }
      if (!address || typeof address !== 'string' || !address.trim()) {
        throw new Error('Delivery address is required');
      }
  
      const response = await api.post("/api/order", {
        cart,        // Array of cart items with product details
        totalPrice,  // Total price of the order
        address      // Delivery address
      });
  
      // Clear local cart after successful order
      // You might want to implement a separate method for this
      localStorage.removeItem('cart');
      
      return response.data; // Returns the created order object
    } catch (error) {
      if (error.response?.status === 400) {
        // Handle out of stock error
        throw new Error(error.response.data.msg || "Some products are out of stock");
      }
      if (error.response?.status === 404) {
        // Handle product not found error
        throw new Error(error.response.data.msg || "Product not found");
      }
      throw this.handleError(error);
    }
  }

  // Lấy danh sách đơn hàng của người dùng
  static async getMyOrders() {
    try {
      const response = await api.get("/api/orders/me");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export const ProductCategories = {
  MOBILES: "Mobiles",
  ESSENTIALS: "Essentials",
  APPLIANCES: "Appliances",
  BOOKS: "Books",
  FASHION: "Fashion",
};
