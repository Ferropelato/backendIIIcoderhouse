const { Schema, model } = require('mongoose');
const { DELIVERY_STATUS, VOUCHER_TYPES } = require('../constants');
const buildFileMetadataSchema = require('./fileMetadata.schema');

const deliverySchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    deliveryAgent: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: Object.values(DELIVERY_STATUS),
      default: DELIVERY_STATUS.ASSIGNED,
    },
    address: { type: String, required: true },
    estimatedDeliveryDate: { type: Date, required: true },
    vouchers: {
      type: [buildFileMetadataSchema(Object.values(VOUCHER_TYPES))],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = model('Delivery', deliverySchema);
