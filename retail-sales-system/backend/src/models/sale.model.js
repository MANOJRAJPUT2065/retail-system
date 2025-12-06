import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cash', 'Wallet'],
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
      default: 'Pending',
    },
    deliveryType: {
      type: String,
      enum: ['Standard', 'Express', 'Same Day', 'Next Day', 'Store Pickup'],
      default: 'Standard',
    },
    storeId: {
      type: String,
      index: true,
    },
    storeLocation: String,
    salespersonId: String,
    employeeName: String,
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for search and filtering performance
saleSchema.index({ date: -1 }); // For sorting by date
saleSchema.index({ customer: 1, date: -1 }); // For customer purchase history
saleSchema.index({ product: 1, date: -1 }); // For product sales history
saleSchema.index({ orderStatus: 1, date: -1 }); // For order status tracking
saleSchema.index({ storeId: 1, date: -1 }); // For store performance
saleSchema.index({ 'customer.name': 'text', 'product.name': 'text' }); // For text search

// Pre-save hook to calculate amounts
saleSchema.pre('save', function (next) {
  if (this.isModified('quantity') || this.isModified('pricePerUnit') || this.isModified('discountPercentage')) {
    this.totalAmount = this.quantity * this.pricePerUnit;
    const discountAmount = (this.totalAmount * this.discountPercentage) / 100;
    this.finalAmount = this.totalAmount - discountAmount;
  }
  next();
});

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;
