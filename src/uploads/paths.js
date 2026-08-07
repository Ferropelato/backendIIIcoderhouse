const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const UPLOAD_ROOT = path.join(PROJECT_ROOT, 'uploads');

const UPLOAD_DIRS = {
  userDocuments: path.join(UPLOAD_ROOT, 'user-documents'),
  deliveryVouchers: path.join(UPLOAD_ROOT, 'delivery-vouchers'),
};

Object.values(UPLOAD_DIRS).forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

function toRelativePath(absolutePath) {
  return path.relative(PROJECT_ROOT, absolutePath).split(path.sep).join('/');
}

module.exports = { UPLOAD_ROOT, UPLOAD_DIRS, toRelativePath };
