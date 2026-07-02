const ProductModel = require('../models/product.model');

class ProductRepository {
  async getAll(filter = {}) {
    return ProductModel.find(filter).select('-__v');
  }

  async getById(id) {
    return ProductModel.findById(id).select('-__v');
  }

  async getByCode(code) {
    return ProductModel.findOne({ code });
  }

  async create(productData) {
    return ProductModel.create(productData);
  }

  async updateById(id, updates) {
    return ProductModel.findByIdAndUpdate(id, updates, { new: true }).select('-__v');
  }

  async deleteById(id) {
    return ProductModel.findByIdAndDelete(id);
  }
}

module.exports = new ProductRepository();
