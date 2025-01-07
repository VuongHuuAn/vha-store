import axios from "axios";
import { URI } from "../../constants/global_variables";
const api = axios.create({
  baseURL: URI,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export class SellerService {
  // Image Upload Methods
  static async uploadImage(file, folder = "products") {
    try {
      await this.validateFile(file);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "qfpqu7pe");
      formData.append("cloud_name", "drylewuid");
      formData.append("folder", folder);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/drylewuid/image/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      throw new Error("Error uploading image: " + error.message);
    }
  }

  static validateFile(file) {
    return new Promise((resolve, reject) => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        reject(new Error("File size should not exceed 5MB"));
      }
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        reject(new Error("Only JPG, PNG and WEBP files are allowed"));
      }
      resolve(true);
    });
  }

  static async uploadMultipleImages(files, folder = "products") {
    try {
      const uploadPromises = Array.from(files).map((file) =>
        this.uploadImage(file, folder)
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new Error("Error uploading multiple images: " + error.message);
    }
  }

  // PRODUCTS CRUD
  static async addProduct(productData) {
    try {
      const response = await api.post("/seller/add-product", productData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async getProducts() {
    try {
      const response = await api.get("/seller/get-products");
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async updateProduct(productId, productData) {
    try {
      const response = await api.post("/seller/update-product", {
        id: productId,
        ...productData,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async deleteProduct(productId) {
    try {
      const response = await api.post("/seller/delete-product", {
        id: productId,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Seller Profile Methods
  static async registerAsSeller(sellerData) {
    try {
      const response = await api.post("/api/register-seller", sellerData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async getSellerRequestStatus() {
    try {
      const response = await api.get("/api/seller-request-status");
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Shop Management Methods
  static async getShopData(sellerId) {
    try {
      const response = await api.get(`/seller/shop-data/${sellerId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async getShopStats(sellerId) {
    try {
      const response = await api.get(`/seller/shop-stats/${sellerId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Follow/Unfollow Methods
  static async followSeller(sellerId) {
    try {
      const response = await api.post("/seller/follow", { sellerId });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async unfollowSeller(sellerId) {
    try {
      const response = await api.post("/seller/unfollow", { sellerId });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Order Management Methods
  static async getOrders() {
    try {
      const response = await api.get("/seller/get-orders");
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async changeOrderStatus(orderId, status) {
    try {
      const response = await api.post("/seller/change-order-status", {
        id: orderId,
        status,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

    // Thêm method để lấy userId của seller hiện tại
    static getCurrentSellerId() {
      const sellerId = localStorage.getItem('userId');
      if (!sellerId) {
          throw new Error('No seller ID found');
      }
      return sellerId;
  }

  // Analytics Methods
  static async getAnalytics() {
    try {
      const response = await api.get("/seller/analytics");
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Discount Management
  static async setDiscount(productId, discountData) {
    try {
      const response = await api.post(
        `/seller/set-discount/${productId}`,
        discountData
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Error Handler
  static handleError(error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An error occurred";
    throw new Error(errorMessage);
  }
}

export const ProductCategories = {
  MOBILES: "Mobiles",
  ESSENTIALS: "Essentials",
  APPLIANCES: "Appliances",
  BOOKS: "Books",
  FASHION: "Fashion",
};
