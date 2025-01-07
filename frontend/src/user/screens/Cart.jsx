import { useState, useEffect } from 'react';
import { UserService } from '../services/UserService';
import { Link, useNavigate } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import { toast } from 'react-toastify';

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const { product, quantity } = item;
  const price = product?.price || 0;
  const discount = product?.discount || 0;
  const finalPrice = discount > 0 ? price * (1 - discount/100) : price;

  return (
    <div className="flex items-center border rounded-lg p-4 shadow-sm">
      <img 
        src={product?.images?.[0]} 
        alt={product?.name}
        className="w-24 h-24 object-cover rounded"
      />
      <div className="flex-1 ml-4">
        <h3 className="font-semibold text-lg">{product?.name}</h3>
        <div className="text-gray-600">
          <span className="line-through">${price.toFixed(2)}</span>
          {discount > 0 && (
            <span className="ml-2 text-red-500">-{discount}% OFF</span>
          )}
        </div>
        <div className="font-bold text-lg">${finalPrice.toFixed(2)}</div>
        
        <div className="flex items-center mt-2">
          <button 
            onClick={() => onQuantityChange(product?._id, quantity - 1)}
            className="px-3 py-1 border rounded-l bg-gray-100 hover:bg-gray-200"
          >
            -
          </button>
          <span className="px-4 py-1 border-t border-b min-w-[40px] text-center">
            {quantity}
          </span>
          <button 
            onClick={() => onQuantityChange(product?._id, quantity + 1)}
            className="px-3 py-1 border rounded-r bg-gray-100 hover:bg-gray-200"
          >
            +
          </button>
          
          <button 
            onClick={() => onRemove(product?._id)}
            className="ml-4 text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="text-right font-bold">
        ${(finalPrice * quantity).toFixed(2)}
      </div>
    </div>
  );
};

const OrderSummary = ({ subtotal, onCheckout }) => (
  <div className="border rounded-lg p-6 shadow-sm bg-white sticky top-4">
    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-gray-600">
        <span>Shipping</span>
        <span>Calculated at checkout</span>
      </div>
      <div className="border-t pt-2 mt-2">
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
    <button
      onClick={onCheckout}
      className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6 hover:bg-blue-700 transition-colors"
    >
      Proceed to Checkout
    </button>
  </div>
);

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const navigate = useNavigate();

  const calculateSubtotal = (cartItems) => {
    if (!cartItems?.length) return 0;
    return cartItems.reduce((sum, item) => {
      const price = item.product?.price || 0;
      const discount = item.product?.discount || 0;
      const finalPrice = discount > 0 ? price * (1 - discount/100) : price;
      return sum + (finalPrice * item.quantity);
    }, 0);
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await UserService.getCart();
      setCart(response);
      setSubtotal(calculateSubtotal(response));
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      const result = newQuantity > (cart.find(item => item.product?._id === productId)?.quantity || 0)
        ? await UserService.addToCart(productId)
        : await UserService.removeFromCart(productId, false);

      if (result?.cart) {
        setCart(result.cart);
        setSubtotal(result.subtotal || calculateSubtotal(result.cart));
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const result = await UserService.removeFromCart(productId, true);
      if (result?.cart) {
        setCart(result.cart);
        setSubtotal(result.subtotal || calculateSubtotal(result.cart));
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCheckout = () => {
    if (!cart?.length) {
      toast.error('Cart cannot be empty');
      return;
    }
    navigate('/order');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <NavigationBar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

        {!cart?.length ? (
          <div className="text-center py-8">
            <p className="mb-4">Your cart is empty</p>
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <CartItem
                  key={item.product?._id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
            <div className="lg:col-span-1">
              <OrderSummary 
                subtotal={subtotal}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;