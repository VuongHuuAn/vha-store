import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./user/screens/Home";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SellerScreen from "./seller/screens/SellerScreen";
import Category from "./user/screens/Category";
import ProductDetail from "./user/screens/ProductDetail";
import Cart from "./user/screens/Cart";
import Order from "./user/screens/Order";
import MyOrder from "./user/screens/MyOrder";
import AdminScreen from "./admin/screens/AdminScreen";
import TurnSeller from "./user/screens/TurnSeller";

import SellerManagement from './admin/screens/SellerManagement';
import Request from './admin/screens/Request';




function App() {
  return (
    <>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          
          <Route path="/about" element={<Home />} />
          <Route path="/products" element={<Home />} />
          <Route path="/why-us" element={<Home />} />
          <Route path="/testimonial" element={<Home />} />
          <Route path="/turn-seller" element={<TurnSeller />} />
          <Route path="/seller" element={<SellerScreen />} />
          <Route path="/category" element={<Category />} /> {/* Route mặc định */}
          <Route path="/category/:category" element={<Category />} /> {/* Route với category parameter */}
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} /> 
          <Route path="/order" element={<Order />} />
          <Route path="/myorder" element={<MyOrder />} /> 
          <Route path="/login-success" element={<Navigate to="/" />} />
          {/* Admin Routes */}
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="/admin/seller-management" element={<SellerManagement />} />
        <Route path="/admin/requests" element={<Request />} />
       
      
           
          {/* Catch all route - Redirect về home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      <ToastContainer />
    </>
  );
}

export default App;