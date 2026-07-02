const { Schema, model } = require('mongoose');
const { PRODUCT_STATUS } = require('../constants');

const productSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.AVAILABLE,
    },
    thumbnails: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = model('Product', productSchema);
