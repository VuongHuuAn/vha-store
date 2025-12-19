import { createContext, useState, useContext, useEffect } from 'react';
import AuthService from '../auth/services/AuthService';
import { useNavigate, useLocation } from 'react-router-dom'; // Thêm useLocation

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // Thêm để xử lý callback từ Google

  useEffect(() => {
    const initAuth = async () => {
      // Xử lý Google OAuth callback
      if (location.pathname === '/login-success') {
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.has('data')) {
          try {
            const { user } = await AuthService.handleGoogleCallback(searchParams);
            setUser(user);
            if (user.type === 'admin') {
              navigate('/admin', { replace: true });
            } else {
              navigate('/', { replace: true });
            }
            return;
          } catch (error) {
            console.error('Google login error:', error);
            navigate('/login', { replace: true });
            return;
          }
        }
      }

      // Kiểm tra user hiện tại
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const currentPath = location.pathname;

        if (['/login', '/register'].includes(currentPath)) {
          if (currentUser.type === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        } else if (currentUser.type === 'admin' && !currentPath.startsWith('/admin')) {
          navigate('/admin', { replace: true });
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [navigate, location]);

  const login = async (email, password) => {
    const data = await AuthService.login(email, password);
    setUser(data.user);
    return data;
  };

   // Thêm phương thức requestPasswordReset
   const requestPasswordReset = async (email) => {
    return await AuthService.requestPasswordReset(email);
  };

  // Thêm phương thức updatePassword
  const updatePassword = async (resetToken, newPassword) => {
    return await AuthService.updatePassword(resetToken, newPassword);
  };

  const googleLogin = () => {
    AuthService.initiateGoogleLogin();
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    navigate('/login', { replace: true });
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    googleLogin, 
    logout,
    requestPasswordReset,
    updatePassword
  };

  if (isLoading) {
    return null; 
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};