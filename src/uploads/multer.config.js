const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { UPLOAD_DIRS } = require('./paths');
const { InvalidFileTypeError } = require('../errors');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const USER_DOCUMENT_FIELD = 'document';
const DELIVERY_VOUCHER_FIELD = 'voucher';

function buildStorage(destinationDir) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, destinationDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
      const extension = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${extension}`);
    },
  });
}

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new InvalidFileTypeError(file.mimetype, ALLOWED_MIME_TYPES));
  }
  cb(null, true);
}

function createUploader(destinationDir) {
  return multer({
    storage: buildStorage(destinationDir),
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
  });
}

const userDocumentsUpload = createUploader(UPLOAD_DIRS.userDocuments);
const deliveryVouchersUpload = createUploader(UPLOAD_DIRS.deliveryVouchers);

module.exports = {
  userDocumentsUpload,
  deliveryVouchersUpload,
  USER_DOCUMENT_FIELD,
  DELIVERY_VOUCHER_FIELD,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_MB,
};
