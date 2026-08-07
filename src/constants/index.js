const ROLES = Object.freeze({
  ADMIN: 'admin',
  USER: 'user',
  DELIVERY: 'delivery',
});

const PRODUCT_STATUS = Object.freeze({
  AVAILABLE: 'available',
  OUT_OF_STOCK: 'out_of_stock',
});

const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
});

const ORDER_PRIORITY = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
});

const DELIVERY_STATUS = Object.freeze({
  ASSIGNED: 'assigned',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  FAILED: 'failed',
});

const USER_DOCUMENT_TYPES = Object.freeze({
  ID_CARD: 'id_card',
  DRIVER_LICENSE: 'driver_license',
  PROOF_OF_ADDRESS: 'proof_of_address',
});

const VOUCHER_TYPES = Object.freeze({
  DELIVERY_PROOF: 'delivery_proof',
  SIGNATURE: 'signature',
  INVOICE: 'invoice',
});

module.exports = {
  ROLES,
  PRODUCT_STATUS,
  ORDER_STATUS,
  ORDER_PRIORITY,
  DELIVERY_STATUS,
  USER_DOCUMENT_TYPES,
  VOUCHER_TYPES,
};
