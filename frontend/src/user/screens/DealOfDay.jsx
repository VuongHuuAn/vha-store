import { useEffect, useState } from "react";
import { UserService } from "../services/UserService";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AuthDialog from './AuthDialog';
import { useAuth } from '../../context/AuthContext';

export default function DealOfDay() {
  const { user } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const data = await UserService.getDealOfDay();
        setDeals(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching deals:", error);
        setError(error.message || "Failed to load deals");
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleProductClick = (e, productId) => {
    e.preventDefault();
    if (!user) {
      setIsAuthDialogOpen(true);
      return;
    }
    window.location.href = `/product/${productId}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-gray-200 h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-2">Error Loading Deals</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-600">
          No active deals at the moment
        </h2>
        <p className="text-gray-500 mt-2">
          Please check back later for exciting offers!
        </p>
      </div>
    );
  }

  const bestDeal = deals[0];
  const otherDeals = deals.slice(1);

  const SaleTag = ({ percentage }) => (
    <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
      <div className="text-2xl font-bold flex items-center">
        <span className="mr-1">-{percentage}%</span>
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      </div>
      <div className="text-xs font-medium">Flash Deal</div>
    </div>
  );
  
  // Thêm component PriceDisplay
  const PriceDisplay = ({ price, finalPrice, discount, size = "normal" }) => {
    const savings = price - finalPrice;
    const classes = {
      normal: {
        container: "flex items-center space-x-2",
        currentPrice: "text-xl font-bold text-red-600",
        originalPrice: "text-sm text-gray-500 line-through",
        savings: "text-sm text-green-600 font-medium",
      },
      large: {
        container: "flex items-start space-x-4",
        currentPrice: "text-4xl font-bold text-red-600",
        originalPrice: "text-xl text-gray-500 line-through",
        savings: "text-lg text-green-600 font-medium",
      },
    };
  
    const style = classes[size];
  
    return (
      <div className={style.container}>
        <div className="flex flex-col">
          <span className={style.currentPrice}>${finalPrice?.toFixed(2)}</span>
          {discount?.percentage > 0 && (
            <span className={style.originalPrice}>${price?.toFixed(2)}</span>
          )}
        </div>
        {discount?.percentage > 0 && savings > 0 && (
          <div className="bg-red-50 px-3 py-1 rounded-full border border-red-100">
            <span className={style.savings}>Save ${savings.toFixed(2)}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="container mx-auto px-4 py-12">
   {/* Best Deal Section */}
{bestDeal && (
  <div className="mb-12">
    <h2 className="text-3xl font-bold mb-8 text-center">
      <span className="text-red-600">⚡ Flash Sale</span> - Deals of the Day
    </h2>
    <Link
      to={`/product/${bestDeal._id}`}
      onClick={(e) => handleProductClick(e, bestDeal._id)}
      className="grid md:grid-cols-2 gap-8 bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="relative h-[400px] group">
        <img
          src={bestDeal.images[0]}
          alt={bestDeal.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Sale Tag */}
        {bestDeal.discount > 0 && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
            <div className="text-2xl font-bold flex items-center">
              <svg className="w-6 h-6 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              -{bestDeal.discount}%
            </div>
            <div className="text-xs font-medium">Flash Deal</div>
          </div>
        )}
        {/* End Date Tag */}
        {bestDeal.endDate && (
          <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
            <div className="flex items-center">
              <span className="animate-pulse mr-2 text-2xl">⏰</span>
              <span className="font-medium">
                Flash Sale Ends: {formatDate(bestDeal.endDate)}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="p-8 flex flex-col justify-center">
        
        <div className="space-y-6">
        <div className="mb-6">
  <h3 className="text-2xl font-bold text-gray-800 mb-2">{bestDeal.name}</h3>
  {bestDeal.sellerId?.shopName && (
    <div className="flex items-center space-x-2">
      <img 
        src={bestDeal.sellerId.shopAvatar || '/default-shop.png'} 
        alt={bestDeal.sellerId.shopName}
        className="w-6 h-6 rounded-full object-cover"
      />
      <p className="text-gray-600 flex items-center">
        
        Sold by {bestDeal.sellerId.shopName}
      </p>
    </div>
  )}
</div>
          {/* Price Display */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-red-600">
                ${bestDeal.finalPrice?.toFixed(2)}
              </span>
              {bestDeal.discount > 0 && (
                <span className="text-2xl text-gray-500 line-through">
                  ${bestDeal.price?.toFixed(2)}
                </span>
              )}
            </div>
            {bestDeal.discount > 0 && (
              <div className="bg-red-50 px-3 py-1 rounded-full border border-red-100 inline-flex items-center w-fit">
                <span className="text-red-600 font-medium">
                  Save ${(bestDeal.price - bestDeal.finalPrice).toFixed(2)}
                </span>
              </div>
            )}
          </div>
          {/* Rating Display */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <span className="text-yellow-400 text-xl">★</span>
              <span className="font-medium ml-1">
                {bestDeal.avgRating?.toFixed(1) || "N/A"}
              </span>
            </div>
            <span className="text-gray-500">
              ({bestDeal.ratings?.length || 0} reviews)
            </span>
          </div>
          {/* Sale Timer */}
          {bestDeal.endDate && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <p className="text-red-600 font-medium flex items-center">
                <span className="text-2xl mr-2 animate-pulse">⏰</span>
                Limited Time Offer - Ends {formatDate(bestDeal.endDate)}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  </div>
)}

 {/* Other Deals Section */}
{otherDeals.filter(product => product.discount > 0).length > 0 && (
  <div className="mb-12">
    <h2 className="text-2xl font-bold mb-6 flex items-center">
      <span className="mr-2">🔥</span>
      More Flash Deals
    </h2>
    <Slider {...sliderSettings} className="deal-slider">
      {otherDeals
        .filter(product => product.discount > 0)
        .map((product) => (
        <div key={product._id} className="px-2">
          <Link
            to={`/product/${product._id}`}
            onClick={(e) => handleProductClick(e, product._id)}
            className="block bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 h-full"
          >
            <div className="relative overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full aspect-square object-cover rounded-t-lg hover:scale-105 transition-transform duration-300"
              />
              {/* Sale Tag */}
              <div className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-1.5 rounded-full">
                <div className="text-sm font-bold flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  -{product.discount}%
                </div>
              </div>
              {/* End Date Tag */}
              {product.endDate && (
                <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-75 text-white px-3 py-1.5 rounded-lg">
                  <div className="text-xs font-medium flex items-center">
                    <span className="animate-pulse mr-1">⏰</span>
                    Ends: {formatDate(product.endDate)}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3 truncate">
                {product.name}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-red-600">
                    ${product.finalPrice?.toFixed(2)}
                  </span>
                  <span className="text-base text-gray-500 line-through">
                    ${product.price?.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
  <div className="flex items-center">
    <span className="text-yellow-400">★</span>
    <span className="text-sm text-gray-600 ml-1">
      {product.avgRating?.toFixed(1) || "N/A"}
    </span>
  </div>
  {product.sellerId?.shopName && (
    <div className="flex items-center space-x-2">
      <img 
        src={product.sellerId.shopAvatar || '/default-shop.png'} 
        alt={product.sellerId.shopName}
        className="w-4 h-4 rounded-full object-cover"
      />
      <span className="text-xs text-gray-500">
        {product.sellerId.shopName}
      </span>
    </div>
  )}
</div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </Slider>
  </div>
)}
      
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
      />
    </section>
  );
}