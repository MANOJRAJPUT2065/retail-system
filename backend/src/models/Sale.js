const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  customerName: { type: String, required: true, index: true },
  phoneNumber: { type: String, required: true, index: true },
  gender: { type: String, required: true },
  age: { type: Number, required: true },
  customerRegion: { type: String, required: true },
  customerType: { type: String, required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  brand: { type: String, required: true },
  productCategory: { type: String, required: true },
  tags: [{ type: String }],
  quantity: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  discountPercentage: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  finalAmount: { type: Number, required: true },
  date: { type: Date, required: true, index: true },
  paymentMethod: { type: String, required: true },
  orderStatus: { type: String, required: true },
  deliveryType: { type: String, required: true },
  storeId: { type: String, required: true },
  storeLocation: { type: String, required: true },
  salespersonId: { type: String, required: true },
  employeeName: { type: String, required: true }
}, {
  timestamps: true
});

// Create indexes for search and filtering
saleSchema.index({ customerName: 'text', phoneNumber: 'text' });
saleSchema.index({ customerRegion: 1 });
saleSchema.index({ gender: 1 });
saleSchema.index({ productCategory: 1 });
saleSchema.index({ paymentMethod: 1 });
saleSchema.index({ date: -1 });

module.exports = mongoose.model('Sale', saleSchema);

