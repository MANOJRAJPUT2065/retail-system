import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: 'text', // For text search
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      index: 'text', // For text search
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    age: {
      type: Number,
      min: 0,
      max: 120,
      required: true,
    },
    region: {
      type: String,
      required: true,
      index: true,
    },
    customerType: {
      type: String,
      enum: ['Regular', 'Premium', 'VIP'],
      default: 'Regular',
    },
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

// Indexes for search performance
customerSchema.index({ name: 1, phoneNumber: 1 });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
