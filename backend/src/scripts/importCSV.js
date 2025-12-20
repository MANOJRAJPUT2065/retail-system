const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Sale = require('../models/Sale');
require('dotenv').config();

const CSV_FILE_PATH = path.join(__dirname, '../../uploads/truestate_assignment_dataset.csv');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://manojrajput2065:Himalaya%40123@cluster0.qpxsllw.mongodb.net/retail_sales', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Read and import CSV data
const pick = (row, keys, def = '') => {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') return row[k];
  }
  return def;
};

const parseNumber = (val, def = 0) => {
  if (val === undefined || val === null) return def;
  const num = Number(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? def : num;
};

const importCSV = async () => {
  let saved = 0;
  let processed = 0;
  const batchSize = 5000;
  let batch = [];

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(CSV_FILE_PATH).pipe(csv());

    stream
      .on('data', async (row) => {
        processed++;

        const quantity = parseNumber(pick(row, ['quantity', 'Quantity'], 1), 1);
        const totalAmount = parseNumber(pick(row, ['totalAmount', 'Total Amount'], quantity), quantity);
        const pricePerUnit = parseNumber(pick(row, ['pricePerUnit', 'Price Per Unit'], totalAmount / Math.max(quantity, 1)), totalAmount / Math.max(quantity, 1));

        const record = {
          customerId: pick(row, ['customerId', 'Customer ID'], `CUST${processed}`),
          customerName: pick(row, ['customerName', 'Customer name'], 'Unknown'),
          phoneNumber: pick(row, ['phoneNumber', 'Phone Number'], ''),
          gender: pick(row, ['gender', 'Gender'], 'Other'),
          age: parseNumber(pick(row, ['age', 'Age'], 0), 0),
          customerRegion: pick(row, ['customerRegion', 'Region'], 'Unknown'),
          customerType: 'Regular',
          productId: `PROD-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          productName: pick(row, ['productName', 'Product'], pick(row, ['productCategory', 'Product Category'], 'Unknown Product')),
          brand: 'Generic',
          productCategory: pick(row, ['productCategory', 'Product Category'], 'General'),
          tags: [],
          quantity,
          pricePerUnit,
          discountPercentage: parseNumber(pick(row, ['discountPercentage', 'Discount %'], 0), 0),
          totalAmount,
          finalAmount: parseNumber(pick(row, ['finalAmount', 'Final Amount'], totalAmount), totalAmount),
          date: new Date(pick(row, ['date', 'Date'], new Date().toISOString())),
          paymentMethod: pick(row, ['paymentMethod', 'Payment Method'], 'Cash'),
          orderStatus: pick(row, ['orderStatus', 'Status'], 'Completed'),
          deliveryType: 'Standard',
          storeId: 'STORE-001',
          storeLocation: pick(row, ['storeLocation', 'Store Location'], pick(row, ['customerRegion', 'Region'], 'Unknown')),
          salespersonId: `EMP-${Math.floor(Math.random() * 1000)}`,
          employeeName: 'CSV Import'
        };

        // Ensure finalAmount consistent if missing
        if (!record.finalAmount || record.finalAmount === 0) {
          const discountAmount = (record.totalAmount * record.discountPercentage) / 100;
          record.finalAmount = record.totalAmount - discountAmount;
        }

        batch.push(record);

        if (processed % 10000 === 0) {
          console.log(`📊 Processed ${processed} rows`);
        }

        if (batch.length >= batchSize) {
          stream.pause();
          try {
            const result = await Sale.insertMany(batch, { ordered: false });
            saved += Array.isArray(result) ? result.length : 0;
            console.log(`✅ Saved ${saved} so far`);
          } catch (err) {
            if (err.insertedDocs) {
              saved += err.insertedDocs.length;
              console.log(`⚠️  Batch had errors; saved ${err.insertedDocs.length} docs`);
            } else {
              console.error('❌ Batch insert error:', err.message);
            }
          } finally {
            batch = [];
            stream.resume();
          }
        }
      })
      .on('end', async () => {
        try {
          if (batch.length > 0) {
            const result = await Sale.insertMany(batch, { ordered: false });
            saved += Array.isArray(result) ? result.length : 0;
          }
          console.log(`\n✅ CSV parse complete. Processed: ${processed}, Inserted: ${saved}`);
          resolve({ processed, saved });
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV:', error);
        reject(error);
      });
  });
};

// Save records to MongoDB
// saveToMongoDB no longer needed with streaming batches

// Main execution
const main = async () => {
  try {
    console.log('🚀 Starting CSV import process...\n');
    console.log(`📁 Reading file: ${CSV_FILE_PATH}\n`);

    // Check if file exists
    if (!fs.existsSync(CSV_FILE_PATH)) {
      console.error('❌ CSV file not found:', CSV_FILE_PATH);
      console.error('📝 Please ensure truestate_assignment_dataset.csv is in the uploads folder');
      process.exit(1);
    }

    // Connect to MongoDB
    await connectDB();

    // Import CSV data (streaming + batched inserts)
    const { processed, saved } = await importCSV();

    console.log(`\n✅ Import completed successfully! Inserted ${saved} of ${processed} processed`);
    console.log('🌐 You can now view the data on frontend at: http://localhost:5173/sales');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
};

// Run the script
main();
