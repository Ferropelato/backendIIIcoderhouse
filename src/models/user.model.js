const { Schema, model } = require('mongoose');
const { ROLES, USER_DOCUMENT_TYPES } = require('../constants');
const buildFileMetadataSchema = require('./fileMetadata.schema');

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    documents: {
      type: [buildFileMetadataSchema(Object.values(USER_DOCUMENT_TYPES))],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = model('User', userSchema);
