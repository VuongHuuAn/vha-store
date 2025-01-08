// server/models/product.js

const mongoose = require("mongoose");
const ratingSchema = require("./rating");
const commentSchema = require("./comment");
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
},
  ratings: [ratingSchema],
  avgRating: {
      type: Number,
      default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
    default: null,
  },
  endDate: {
    type: Date, 
    default: null,
  },
  // Thêm field này để lưu giá sau khi giảm
  finalPrice: {
    type: Number,
    default: function() {
      return this.price;
    }
  },
  comments: [commentSchema],
  commentCount: {  // Thêm trường đếm số comment
    type: Number,
    default: 0
  }
});


// Method để kiểm tra và cập nhật finalPrice
productSchema.methods.updateFinalPrice = function() {
  const now = new Date();
  const currentTime = now.getTime();
  const startTime = this.startDate ? new Date(this.startDate).getTime() : null;
  const endTime = this.endDate ? new Date(this.endDate).getTime() : null;

  if (this.discount > 0 && startTime && endTime) {
    if (currentTime >= startTime && currentTime <= endTime) {
      // Trong thời gian giảm giá
      this.finalPrice = this.price * (1 - this.discount / 100);
    } else if (currentTime > endTime) {
      // Hết thời gian giảm giá
      this.finalPrice = this.price;
      this.discount = 0;
      this.startDate = null;
      this.endDate = null;
    }
  } else {
    this.finalPrice = this.price;
  }
};

// Middleware pre-save
productSchema.pre('save', function(next) {
  this.updateFinalPrice();
  this.commentCount = this.comments.length;
  next();
});

// Middleware post-find
productSchema.post('find', async function(docs) {
  if (Array.isArray(docs)) {
    const updates = docs.map(doc => {
      if (doc && typeof doc.updateFinalPrice === 'function') {
        doc.updateFinalPrice();
        return doc.save();
      }
      return null;
    });
    await Promise.all(updates.filter(Boolean));
  }
});

// Middleware post-findOne
productSchema.post('findOne', async function(doc) {
  if (doc && typeof doc.updateFinalPrice === 'function') {
    doc.updateFinalPrice();
    await doc.save();
  }
});
const Product = mongoose.model("Product", productSchema);
module.exports = { Product, productSchema };