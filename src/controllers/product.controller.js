const productService = require('../services/product.service');

class ProductController {
  async getAll(req, res) {
    try {
      const { available } = req.query;
      const products = available === 'true'
        ? await productService.getAvailableProducts()
        : await productService.getAllProducts();
      res.status(200).json({ status: 'success', payload: products });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const product = await productService.getProductById(req.params.pid);
      res.status(200).json({ status: 'success', payload: product });
    } catch (error) {
      res.status(404).json({ status: 'error', message: error.message });
    }
  }

  async create(req, res) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json({ status: 'success', payload: product });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async update(req, res) {
    try {
      const product = await productService.updateProduct(req.params.pid, req.body);
      res.status(200).json({ status: 'success', payload: product });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await productService.deleteProduct(req.params.pid);
      res.status(200).json({ status: 'success', message: 'Producto eliminado' });
    } catch (error) {
      res.status(404).json({ status: 'error', message: error.message });
    }
  }
}

module.exports = new ProductController();
