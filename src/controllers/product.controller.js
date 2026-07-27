const productService = require('../services/product.service');
const catchAsync = require('../utils/catchAsync');

class ProductController {
  getAll = catchAsync(async (req, res) => {
    const { available } = req.query;
    const products = available === 'true'
      ? await productService.getAvailableProducts()
      : await productService.getAllProducts();
    res.status(200).json({ status: 'success', payload: products });
  });

  getById = catchAsync(async (req, res) => {
    const product = await productService.getProductById(req.params.pid);
    res.status(200).json({ status: 'success', payload: product });
  });

  create = catchAsync(async (req, res) => {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ status: 'success', payload: product });
  });

  update = catchAsync(async (req, res) => {
    const product = await productService.updateProduct(req.params.pid, req.body);
    res.status(200).json({ status: 'success', payload: product });
  });

  delete = catchAsync(async (req, res) => {
    await productService.deleteProduct(req.params.pid);
    res.status(200).json({ status: 'success', message: 'Producto eliminado' });
  });
}

module.exports = new ProductController();
