import axios from 'axios';
import { URI } from "../../constants/global_variables";

const api = axios.create({
  baseURL: URI, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export class AdminService {
  // Seller Request Management
  static async getSellerRequests() {
    try {
      const response = await api.get('/admin/seller-requests'); // ✅ Khớp
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async processSellerRequest(requestId, status) {
    try {
      const response = await api.post('/admin/process-seller-request', { // ✅ Khớp
        requestId,
        status,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Seller Management
  static async getSellers() {
    try {
      const response = await api.get('/admin/sellers'); 
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async disableSeller(sellerId) {
    try {
      const response = await api.post('/admin/disable-seller', { 
        sellerId,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Statistics
  static async getSellerStats() {
    try {
      const response = await api.get('/admin/seller-stats'); 
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
      'An error occurred';
    throw new Error(errorMessage);
  }
}