import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthDialog from './AuthDialog';
import AuthService from '../../auth/services/AuthService';
const NavigationBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const handleLogout = () => {
    AuthService.logout();
    logout();
    navigate('/');
  };

  const handleSellerAction = () => {
    if (!user) {
      setIsAuthDialogOpen(true);
      return;
    }
    if (user?.type === 'seller') {
      navigate('/seller');
    } else {
      navigate('/turn-seller');
    }
  };

  const handleCategoryClick = (e) => {
    if (!user) {
      e.preventDefault();
      setIsAuthDialogOpen(true);
      return;
    }
    // If user is logged in, continue with normal navigation
  };

  return (
    <nav className="w-full">
      {/* Top Bar */}
      <div className="bg-[#2B3445] text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex space-x-6">
            <span className="flex items-center">
              <span className="mr-2">📞</span>
              +84 0982619529
            </span>
            <span className="flex items-center">
              <span className="mr-2">📍</span>
              TP HCM
            </span>
            <span className="flex items-center">
              <span className="mr-2">⏰</span>
              Daily 10:00–22:00
            </span>
          </div>
          <div className="flex space-x-4">
            <Link to="/news" className="hover:text-yellow-400 transition-colors">News</Link>
            <Link to="/faq" className="hover:text-yellow-400 transition-colors">FAQ</Link>
            <Link to="/payment" className="hover:text-yellow-400 transition-colors">Payment</Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <img
                src="https://img.freepik.com/premium-vector/vha-logo-design-initial-letter-vha-monogram-logo-using-hexagon-shape_1101554-54867.jpg"
                alt="VHA Logo"
                className="h-12 w-auto"
              />
              <span className="text-2xl font-bold text-gray-800">Store</span>
            </Link>

            {/* Main Menu */}
            <div className="flex-1 mx-12">
              <ul className="flex space-x-8">
                <li className="group relative">
                  {user ? (
                    <Link 
                      to="/category" 
                      className="flex items-center hover:text-blue-600 transition-colors"
                    >
                      Category <span className="ml-1">▼</span>
                    </Link>
                  ) : (
                    <button 
                      onClick={handleCategoryClick}
                      className="flex items-center hover:text-blue-600 transition-colors"
                    >
                      Category <span className="ml-1">▼</span>
                    </button>
                  )}
                  {/* Dropdown menu can be added here */}
                </li>
                <li>
                  {user ? (
                    <Link 
                      to="/myorder" 
                      className="hover:text-blue-600 transition-colors"
                    >
                      My Order
                    </Link>
                  ) : (
                    <button
                      onClick={() => setIsAuthDialogOpen(true)}
                      className="hover:text-blue-600 transition-colors"
                    >
                      My Order
                    </button>
                  )}
                </li>
                <li>
                  <button 
                    onClick={handleSellerAction}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {user?.type === 'seller' ? 'My Shop' : 'Turn Seller'}
                  </button>
                </li>
                <li>
                  <Link 
                    to="/about" 
                    className="hover:text-blue-600 transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contacts" 
                    className="hover:text-blue-600 transition-colors"
                  >
                    Contacts
                  </Link>
                </li>
              </ul>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-6">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/favorites" 
                    className="flex items-center hover:text-blue-600 transition-colors"
                  >
                    <span className="mr-1">❤️</span>
                    Favorites
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center hover:text-blue-600 transition-colors">
                      <span className="mr-1">👤</span>
                      {user.name}
                    </button>
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Log   out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthDialogOpen(true)}
                  className="flex items-center hover:text-blue-600 transition-colors"
                >
                  <span className="mr-1">👤</span>
                  Login
                </button>
              )}
              <Link 
                to={user ? "/cart" : "#"}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    setIsAuthDialogOpen(true);
                  }
                }}
                className="flex items-center hover:text-blue-600 transition-colors"
              >
                <span className="mr-1">🛒</span>
                Cart
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
      />
    </nav>
  );
};

export default NavigationBar;