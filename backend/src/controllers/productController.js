const Product = require('../models/product.model');

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

// Get inventory (same as products)
exports.getInventory = async (req, res) => {
  try {
    const inventory = await Product.find().lean();
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory', error });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, quantity, description } = req.body;

    if (!name || !price || quantity === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const product = new Product({
      name,
      category: category || 'Uncategorized',
      price: parseFloat(price),
      quantity: parseInt(quantity),
      description: description || ''
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, quantity, description } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        category,
        price: price !== undefined ? parseFloat(price) : undefined,
        quantity: quantity !== undefined ? parseInt(quantity) : undefined,
        description
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};
