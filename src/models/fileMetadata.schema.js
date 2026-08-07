const { Schema } = require('mongoose');

function buildFileMetadataSchema(allowedDocumentTypes) {
  return new Schema(
    {
      originalName: { type: String, required: true },
      storedName: { type: String, required: true },
      path: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true },
      documentType: { type: String, enum: allowedDocumentTypes, required: true },
      uploadedAt: { type: Date, default: Date.now },
    },
    { _id: true }
  );
}

module.exports = buildFileMetadataSchema;
