import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import AuthService from '../../auth/services/AuthService';
import { URI } from "../../constants/global_variables";

export default function AuthDialog({ isOpen, onClose, initialTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    resetEmail: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, requestPasswordReset, updatePassword } = useAuth();
  const [resetStep, setResetStep] = useState(1);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.user.type === 'admin') {
        window.location.href = '/admin';
      } else {
        onClose();
        toast.success('Đăng nhập thành công!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =  `${URI}/auth/google`;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu không khớp');
      return;
    }
    setIsLoading(true);
    try {
      await AuthService.register(formData.name, formData.email, formData.password);
      setActiveTab('login');
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (resetStep === 1) {
        const response = await requestPasswordReset(formData.resetEmail);
        setResetToken(response.resetToken);
        setResetStep(2);
      } else {
        if (newPassword !== confirmPassword) {
          toast.error('Mật khẩu không khớp');
          return;
        }
        if (newPassword.length < 6) {
          toast.error('Mật khẩu phải có ít nhất 6 ký tự');
          return;
        }
        await updatePassword(resetToken, newPassword);
        toast.success('Cập nhật mật khẩu thành công!');
        setActiveTab('login');
        setResetStep(1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể thực hiện yêu cầu');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black opacity-40" onClick={onClose}></div>
        
        <div className="relative bg-white w-full max-w-md rounded-lg shadow-lg">
          {/* Logo */}
          <div className="text-center pt-6">
            <img
              src="https://img.freepik.com/premium-vector/vha-logo-design-initial-letter-vha-monogram-logo-using-hexagon-shape_1101554-54867.jpg"
              alt="VHA Logo"
              className="h-16 w-auto mx-auto"
            />
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`flex-1 py-4 px-6 text-sm font-medium ${
                activeTab === 'login'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('login')}
            >
              Đăng nhập
            </button>
            <button
              className={`flex-1 py-4 px-6 text-sm font-medium ${
                activeTab === 'register'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('register')}
            >
              Đăng ký
            </button>
            <button
              className={`flex-1 py-4 px-6 text-sm font-medium ${
                activeTab === 'reset'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('reset')}
            >
              Quên mật khẩu
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                  {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Hoặc đăng nhập với
                    </span>
                  </div>
                </div>

                {/* Google Login Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <img
                    className="h-5 w-5 mr-2"
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google logo"
                  />
                  Đăng nhập với Google
                </button>
              </form>
            )}

            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Họ tên"
                  value={formData.name}
                  onChange={handleChange}
                />
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                />
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Xác nhận mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                  {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                </button>
              </form>
            )}

            {activeTab === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {resetStep === 1 ? (
                  <>
                    <div>
                      <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        id="resetEmail"
                        name="resetEmail"
                        type="email"
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nhập email của bạn"
                        value={formData.resetEmail}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                      {isLoading ? 'Đang kiểm tra...' : 'Tiếp tục'}
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu mới
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nhập mật khẩu mới"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Xác nhận mật khẩu
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Xác nhận mật khẩu mới"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                      {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}