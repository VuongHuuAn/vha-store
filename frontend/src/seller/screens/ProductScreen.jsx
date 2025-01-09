import React, { useState, useEffect } from 'react';
import { SellerService, ProductCategories } from '../services/SellerService';
import { Delete as DeleteIcon, Edit as EditIcon, LocalOffer as DiscountIcon } from '@mui/icons-material';

const ProductScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [discountDialog, setDiscountDialog] = useState(false);
  const [discountProduct, setDiscountProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
    images: [],
  });
  const [discountForm, setDiscountForm] = useState({
    percentage: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await SellerService.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    try {
      const urls = await SellerService.uploadMultipleImages(event.target.files);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingProduct) {
        await SellerService.updateProduct(editingProduct._id, formData);
      } else {
        await SellerService.addProduct(formData);
      }
      setOpenDialog(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDiscount = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    
    // Chuyển đổi dữ liệu từ form thành đúng định dạng
    const discountData = {
      percentage: Number(discountForm.percentage),
      startDate: new Date(discountForm.startDate).toISOString(),
      endDate: new Date(discountForm.endDate).toISOString()
    };

    await SellerService.setDiscount(discountProduct._id, discountData);
    setDiscountDialog(false);
    resetDiscountForm();
    fetchProducts();
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await SellerService.deleteProduct(productId);
        fetchProducts();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', quantity: '', category: '', images: [] });
  };

  const resetDiscountForm = () => {
    setDiscountProduct(null);
    setDiscountForm({ percentage: '', startDate: '', endDate: '' });
  };

  const isDiscountActive = (product) => {
    if (!product.discount || !product.startDate || !product.endDate) {
      return false;
    }
    const now = new Date();
    const startDate = new Date(product.startDate);
    const endDate = new Date(product.endDate);
    return product.discount > 0 && now >= startDate && now <= endDate;
  };

  const calculateFinalPrice = (product) => {
    if (isDiscountActive(product)) {
      return product.price * (1 - product.discount / 100);
    }
    return product.price;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">Products List</h2>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          onClick={() => { resetForm(); setOpenDialog(true); }}
        >
          Add Product
        </button>
      </div>

      {error && <div className="p-4 text-red-500">{error}</div>}

      <div className="p-6">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-4">Image</th>
              <th className="pb-4">Name</th>
              <th className="pb-4">Price</th>
              <th className="pb-4">Stock</th>
              <th className="pb-4">Category</th>
              <th className="pb-4">Discount</th>
              <th className="pb-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-b">
                <td className="py-4">
                  <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded" />
                </td>
                <td>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.description}</div>
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className={isDiscountActive(product) ? "text-gray-500 line-through" : ""}>
                      ${product.price.toFixed(2)}
                    </span>
                    {isDiscountActive(product) && (
                      <span className="text-red-600">
                        ${calculateFinalPrice(product).toFixed(2)}
                      </span>
                    )}
                  </div>
                </td>
                <td>{product.quantity}</td>
                <td>{product.category}</td>
                <td>
                  {isDiscountActive(product) ? (
                    <div className="text-green-600">
                      {product.discount}% off
                      <div className="text-xs text-gray-500">
                        Until {formatDate(product.endDate)}
                      </div>
                    </div>
                  ) : product.discount > 0 ? (
                    <div>
                      <span className="text-gray-500">No active discount</span>
                      <div className="text-xs text-red-400">
                        Expired on {formatDate(product.endDate)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500">No discount</span>
                  )}
                </td>
                <td>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(product)} className="p-1 text-blue-500 hover:text-blue-700">
                      <EditIcon />
                    </button>
                    <button onClick={() => handleDelete(product._id)} className="p-1 text-red-500 hover:text-red-700">
                      <DeleteIcon />
                    </button>
                    <button 
                      onClick={() => {
                        setDiscountProduct(product);
                        setDiscountDialog(true);
                      }} 
                      className="p-1 text-green-500 hover:text-green-700"
                    >
                      <DiscountIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Form Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="">Select a category</option>
                    {Object.values(ProductCategories).map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-1 block w-full"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.images.map((url, index) => (
                      <img key={index} src={url} alt="" className="w-24 h-24 object-cover rounded" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discount Dialog */}
      {discountDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                Set Discount for {discountProduct?.name}
              </h2>
            </div>
            <form onSubmit={handleSetDiscount}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={discountForm.percentage}
                    onChange={(e) => setDiscountForm({
                      ...discountForm,
                      percentage: e.target.value
                    })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={discountForm.startDate}
                    onChange={(e) => setDiscountForm({
                      ...discountForm,
                      startDate: e.target.value
                    })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={discountForm.endDate}
                    onChange={(e) => setDiscountForm({
                      ...discountForm,
                      endDate: e.target.value
                    })}
                    required
                  />
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  onClick={() => {
                    setDiscountDialog(false);
                    resetDiscountForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Set Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductScreen;