import axios from "axios";
import { URI } from "../../constants/global_variables";
const api = axios.create({
  baseURL:  URI,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});



api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);


class AuthService {
  async login(email, password) {
    try {
      console.log("Login attempt with:", { email, password });
      const response = await api.post("/api/signin", { email, password });
      console.log("Login response:", response.data);

      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        // Loại bỏ token và _id trước khi lưu user
        const { token, _id, ...userData } = response.data;
        localStorage.setItem("user", JSON.stringify(userData));
        return { user: userData, token };
      } else {
        console.error("Login response missing token:", response.data);
        throw new Error("Invalid login response");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw error;
    }
  }
  initiateGoogleLogin() {
    window.location.href = `${URI}/auth/google`;
  }
  async handleGoogleCallback(searchParams) {
    try {
      const data = JSON.parse(decodeURIComponent(searchParams.get('data')));
      
      if (data && data.token) {
        localStorage.setItem("token", data.token);
        const { token, _id, ...userData } = data;
        localStorage.setItem("user", JSON.stringify(userData));
        
        return { user: userData, token };
      } else {
        throw new Error("Invalid Google login response");
      }
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  }
  // Bước 1: Yêu cầu reset password và nhận token
  async requestPasswordReset(email) {
    try {
      const response = await api.post("/api/reset-password", { email });
      return response.data;
    } catch (error) {
      console.error("Password reset request error:", error.response?.data || error.message);
      throw error;
    }
  }

  // Bước 2: Cập nhật mật khẩu mới với token
  async updatePassword(resetToken, newPassword) {
    try {
      const response = await api.post("/api/update-password", {
        resetToken,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Update password error:", error.response?.data || error.message);
      throw error;
    }
  }



  

  async register(name, email, password) {
    try {
      console.log("Register attempt with:", { name, email, password });
      const response = await api.post("/api/signup", {
        name,
        email,
        password,
      });
      console.log("Register response:", response.data);

      // Sau khi đăng ký thành công, tự động đăng nhập
      return this.login(email, password);
    } catch (error) {
      console.error("Register error:", error.response?.data || error.message);
      throw error;
    }
  }
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      // Nếu có lỗi khi parse JSON, xóa dữ liệu không hợp lệ
      localStorage.removeItem("user");
      return null;
    }
  }

  isAuthenticated() {
    return !!localStorage.getItem("token");
  }
}







export default new AuthService();
