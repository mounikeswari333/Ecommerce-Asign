const mongoose = require('mongoose');

function generateProductId() {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `PSPK-P-${num}`;
}

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      unique: true,
      default: generateProductId,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    subCategory: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    mrp: {
      type: Number,
      required: [true, 'MRP is required'],
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      enum: ['kg', 'litre', 'pack', 'unit'],
      default: 'unit',
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'live', 'rejected', 'out_of_stock'],
      default: 'pending_approval',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
