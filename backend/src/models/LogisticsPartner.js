const mongoose = require('mongoose');

const logisticsPartnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Partner name is required'],
      unique: true,
      trim: true,
    },
    apiKey: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    codAvailable: {
      type: Boolean,
      default: true,
    },
    avgDeliveryDays: {
      type: Number,
      default: 3,
    },
    serviceableStates: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LogisticsPartner', logisticsPartnerSchema);
