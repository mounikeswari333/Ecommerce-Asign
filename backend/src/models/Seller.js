const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Auto-generate Seller ID ───────────────────────────────────────────────────
function generateSellerId() {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `PSPK-S-${num}`;
}

const kycDocSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    url: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String, default: '' },
  },
  { _id: false }
);

const bankDetailsSchema = new mongoose.Schema(
  {
    accountNo: { type: String, default: '' },
    ifsc: { type: String, default: '' },
    accountHolder: { type: String, default: '' },
    bankName: { type: String, default: '' },
  },
  { _id: false }
);

const performanceScoreSchema = new mongoose.Schema(
  {
    fulfillmentRate: { type: Number, default: 0 },
    returnRate: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
  },
  { _id: false }
);

const sellerSchema = new mongoose.Schema(
  {
    sellerId: {
      type: String,
      unique: true,
      default: generateSellerId,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    fssaiLicense: { type: String, default: '' },
    bankDetails: {
      type: bankDetailsSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'blacklisted'],
      default: 'pending',
    },
    kycDocs: {
      type: [kycDocSchema],
      default: [],
    },
    commissionRate: {
      type: Number,
      default: 5,
    },
    categories: {
      type: [String],
      default: [],
    },
    performanceScore: {
      type: performanceScoreSchema,
      default: () => ({}),
    },
    onboardedAt: { type: Date },
    lastActiveAt: { type: Date },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      default: 'seller',
    },
  },
  { timestamps: true }
);

sellerSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Instance method: compare password ────────────────────────────────────────
sellerSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// ── Hide password in JSON output ──────────────────────────────────────────────
sellerSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('Seller', sellerSchema);
