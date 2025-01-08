import React from 'react';
import { useProduct } from '../../context/ProductContext';

const PriceDisplay = ({ 
  price, 
  finalPrice, 
  discount, 
  rating,
  showSaleTag = false,
  showEndDate = false,
  endDate,
  showStars = false,
  product
}) => {
  const { calculateFinalPrice } = useProduct();

  const actualFinalPrice = product ? calculateFinalPrice(product) : finalPrice;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (showSaleTag) {
    return (
      <>
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-1.5 rounded-full">
            <div className="text-sm font-bold flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              -{discount}%
            </div>
          </div>
        )}
        {/* End Date Tag */}
        {showEndDate && endDate && (
          <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-75 text-white px-3 py-1.5 rounded-lg">
            <div className="text-xs font-medium flex items-center">
              <span className="animate-pulse mr-1">⏰</span>
              Ends: {formatDate(endDate)}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-1">
    {/* Price and Discount Section */}
    <div className="flex items-center gap-2">
      {discount > 0 ? (
        <>
          <span className="text-xl font-bold text-red-600">
            ${actualFinalPrice?.toFixed(2)}
          </span>
          <span className="text-base text-gray-500 line-through">
            ${price?.toFixed(2)}
          </span>
        </>
      ) : (
        <span className="text-xl font-bold text-gray-800">
          ${price?.toFixed(2)}
        </span>
      )}
    </div>

      {/* Rating Section */}
      {showStars && (
        <div className="flex items-center">
          <span className="text-yellow-400">★</span>
          <span className="text-sm text-gray-600 ml-1">
            {rating?.toFixed(1) || "N/A"}
          </span>
        </div>
      )}
    </div>
  );
};

export default PriceDisplay;