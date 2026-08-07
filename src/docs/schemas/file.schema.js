module.exports = {
  FileMetadata: {
    type: 'object',
    description: 'Metadatos guardados en la base de datos. El archivo en si se guarda en disco, nunca en MongoDB.',
    properties: {
      _id: { type: 'string', example: '64f1c2b8e1b1c8a1b8e1b1cd' },
      originalName: { type: 'string', example: 'dni-frente.pdf' },
      storedName: { type: 'string', example: '1712345678901-3f9a2b1c.pdf' },
      path: { type: 'string', example: 'uploads/user-documents/1712345678901-3f9a2b1c.pdf' },
      mimeType: { type: 'string', example: 'application/pdf' },
      size: { type: 'integer', description: 'Tamaño en bytes', example: 245678 },
      documentType: { type: 'string', example: 'id_card' },
      uploadedAt: { type: 'string', format: 'date-time', example: '2026-08-07T21:15:56.518Z' },
    },
  },
  UploadUserDocumentInput: {
    type: 'object',
    required: ['document', 'documentType'],
    properties: {
      document: { type: 'string', format: 'binary', description: 'Archivo a subir (imagen o PDF, maximo 5MB).' },
      documentType: {
        type: 'string',
        enum: ['id_card', 'driver_license', 'proof_of_address'],
        description: 'Tipo de documento. Requerido.',
        example: 'id_card',
      },
    },
  },
  UploadDeliveryVoucherInput: {
    type: 'object',
    required: ['voucher'],
    properties: {
      voucher: { type: 'string', format: 'binary', description: 'Archivo a subir (imagen o PDF, maximo 5MB).' },
      voucherType: {
        type: 'string',
        enum: ['delivery_proof', 'signature', 'invoice'],
        description: 'Opcional. Por defecto "delivery_proof".',
        example: 'delivery_proof',
      },
    },
  },
};
