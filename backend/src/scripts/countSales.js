const mongoose = require('mongoose');
const Sale = require('../models/Sale');
require('dotenv').config();

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://manojrajput2065:Himalaya%40123@cluster0.qpxsllw.mongodb.net/retail_sales', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

(async () => {
  try {
    await connectDB();
    const count = await Sale.countDocuments({});
    console.log(`📊 Sales documents count: ${count}`);
    const sample = await Sale.find({}).sort({ date: -1 }).limit(3).lean();
    console.log('🔎 Sample docs:', sample.map(s => ({ customerName: s.customerName, productName: s.productName, finalAmount: s.finalAmount })));
    process.exit(0);
  } catch (e) {
    console.error('❌ Error checking sales count:', e);
    process.exit(1);
  }
})();
