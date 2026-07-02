const productRepository = require('../repositories/product.repository');
const { PRODUCT_STATUS } = require('../constants');

class ProductService {
  async getAllProducts() {
    return productRepository.getAll();
  }

  async getAvailableProducts() {
    return productRepository.getAll({ status: PRODUCT_STATUS.AVAILABLE, stock: { $gt: 0 } });
  }

  async getProductById(id) {
    const product = await productRepository.getById(id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    return product;
  }

  async createProduct(productData) {
    const existing = await productRepository.getByCode(productData.code);
    if (existing) {
      throw new Error(`Ya existe un producto con el codigo ${productData.code}`);
    }

    const status = productData.stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK;

    return productRepository.create({ ...productData, status });
  }

  async updateProduct(id, updates) {
    const nextUpdates = { ...updates };

    if (typeof nextUpdates.stock === 'number') {
      nextUpdates.status = nextUpdates.stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK;
    }

    const product = await productRepository.updateById(id, nextUpdates);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    return product;
  }

  async deleteProduct(id) {
    const product = await productRepository.deleteById(id);
    if (!product) {
      throw new Error('Producto no encontrado');
    }
    return product;
  }
}

module.exports = new ProductService();
