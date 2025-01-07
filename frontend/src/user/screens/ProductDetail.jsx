import { useState, useEffect } from 'react';

import { UserService } from '../services/UserService';
import NavigationBar from './NavigationBar';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PriceDisplay from './PriceDisplay';
const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ content: '', rating: 5 });
  const [newReply, setNewReply] = useState({ commentId: null, content: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    loadProductAndComments();
  }, [productId]);

  const loadProductAndComments = async () => {
    try {
      setLoading(true);
      const [productData, commentsData] = await Promise.all([
        UserService.getProductById(productId),
        UserService.getProductComments(productId)
      ]);
      setProduct(productData);
      setComments(commentsData.comments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (rating) => {
    try {
      await UserService.rateProduct(productId, rating);
      loadProductAndComments(); // Refresh data
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddToCart = async () => {
    try {
      await UserService.addToCart(productId);
      toast.success('Product added to cart successfully!');
      // Chuyển hướng đến trang giỏ hàng
      navigate('/cart');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await UserService.addComment(
        productId,
        newComment.content,
        newComment.rating,
        [], // images array
        false // purchaseVerified
      );
      setNewComment({ content: '', rating: 5 });
      loadProductAndComments();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    try {
      await UserService.addReply(newReply.commentId, newReply.content);
      setNewReply({ commentId: null, content: '' });
      loadProductAndComments();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 min-h-[60vh] flex items-center justify-center">
            Error: {error}
          </div>
        ) : (
          <>
            {/* Product Details Section */}
            <div className="bg-white rounded-lg shadow-sm mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                {/* Product Images */}
                <div className="space-y-4">
  <div className="aspect-w-1 aspect-h-1 relative"> {/* Thêm relative */}
    <img
      src={product?.images[selectedImage]}
      alt={product?.name}
      className="w-full h-full object-cover rounded-lg"
    />
    <PriceDisplay 
      price={product?.price}
      finalPrice={product?.finalPrice}
      discount={product?.discount}
      showSaleTag={true}
      showEndDate={true}
      endDate={product?.endDate}
    />
  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold">{product?.name}</h1>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="text-yellow-400 text-xl">★</span>
                      <span className="ml-1">{product?.avgRating?.toFixed(1) || "0.0"}</span>
                    </div>
                    <span className="text-gray-500">
                      ({product?.ratings?.length || 0} ratings)
                    </span>
                  </div>

                  <PriceDisplay 
    price={product?.price}
    finalPrice={product?.finalPrice}
    discount={product?.discount}
    rating={product?.avgRating}
    showStars={false}
  />

                  {product?.sellerId && (
                    <div className="flex items-center space-x-2 py-2">
                      {product.sellerId.shopAvatar && (
                        <img
                          src={product.sellerId.shopAvatar}
                          alt="Shop"
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <span className="text-gray-700">
                        Sold by {product.sellerId.shopName}
                      </span>
                    </div>
                  )}

                  <p className="text-gray-600">{product?.description}</p>

                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Rating Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Rate this product</h3>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className="text-2xl hover:scale-110 transition-transform"
                  >
                    {star <= (product?.avgRating || 0) ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Comment Form */}
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Add a Comment</h3>
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div>
                  <textarea
                    value={newComment.content}
                    onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Write your comment here..."
                    rows="4"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span>Rating:</span>
                  <select
                    value={newComment.rating}
                    onChange={(e) => setNewComment({ ...newComment, rating: Number(e.target.value) })}
                    className="border rounded p-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Submit Comment
                </button>
              </form>
            </div>

            {/* Comments List */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Comments</h3>
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment._id} className="border rounded p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">{comment.userName}</span>
                      <span className="text-yellow-400">{'★'.repeat(comment.rating)}</span>
                    </div>
                    <p className="mb-4 text-gray-700">{comment.content}</p>
                    
                    {/* Replies */}
                    <div className="ml-8 space-y-2">
                      {comment.replies.map((reply, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded">
                          <div className="font-semibold text-sm text-gray-700">{reply.userName}</div>
                          <p className="text-gray-600">{reply.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Add Reply Form */}
                    {newReply.commentId === comment._id ? (
                      <form onSubmit={handleReplySubmit} className="mt-4">
                        <input
                          type="text"
                          value={newReply.content}
                          onChange={(e) => setNewReply({ ...newReply, content: e.target.value })}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                          placeholder="Write your reply..."
                        />
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            Submit Reply
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewReply({ commentId: null, content: '' })}
                            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setNewReply({ commentId: comment._id, content: '' })}
                        className="text-blue-600 text-sm mt-2 hover:text-blue-700 transition-colors"
                      >
                        Reply
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;