const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config();
const Sale = require('../models/Sale');

const BATCH_SIZE = 1000; // Insert in batches to avoid memory issues

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/retail_sales';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await Sale.deleteMany({});
    console.log('Cleared existing sales data');

    // Read CSV file
    const csvFilePath = path.join(__dirname, '../../truestate_assignment_dataset.csv');
    let batch = [];
    let totalInserted = 0;

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', async (row) => {
          // Parse tags (comma-separated string to array)
          const tags = row.Tags 
            ? row.Tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
            : [];

          // Parse date
          const date = new Date(row.Date);

          // Parse numeric fields
          const age = parseInt(row.Age) || 0;
          const quantity = parseInt(row.Quantity) || 0;
          const pricePerUnit = parseFloat(row['Price per Unit']) || 0;
          const discountPercentage = parseFloat(row['Discount Percentage']) || 0;
          const totalAmount = parseFloat(row['Total Amount']) || 0;
          const finalAmount = parseFloat(row['Final Amount']) || 0;

          batch.push({
            customerId: row['Customer ID'] || '',
            customerName: row['Customer Name'] || '',
            phoneNumber: row['Phone Number'] || '',
            gender: row.Gender || '',
            age: age,
            customerRegion: row['Customer Region'] || '',
            customerType: row['Customer Type'] || '',
            productId: row['Product ID'] || '',
            productName: row['Product Name'] || '',
            brand: row.Brand || '',
            productCategory: row['Product Category'] || '',
            tags: tags,
            quantity: quantity,
            pricePerUnit: pricePerUnit,
            discountPercentage: discountPercentage,
            totalAmount: totalAmount,
            finalAmount: finalAmount,
            date: date,
            paymentMethod: row['Payment Method'] || '',
            orderStatus: row['Order Status'] || '',
            deliveryType: row['Delivery Type'] || '',
            storeId: row['Store ID'] || '',
            storeLocation: row['Store Location'] || '',
            salespersonId: row['Salesperson ID'] || '',
            employeeName: row['Employee Name'] || ''
          });

          // Insert in batches to avoid memory issues
          if (batch.length >= BATCH_SIZE) {
            const batchToInsert = [...batch];
            batch = [];
            
            try {
              await Sale.insertMany(batchToInsert, { ordered: false });
              totalInserted += batchToInsert.length;
              console.log(`Inserted ${totalInserted} records...`);
            } catch (error) {
              console.error('Error inserting batch:', error.message);
            }
          }
        })
        .on('end', async () => {
          try {
            // Insert remaining records
            if (batch.length > 0) {
              await Sale.insertMany(batch, { ordered: false });
              totalInserted += batch.length;
            }

            console.log(`\n✅ Successfully inserted ${totalInserted} sales records from CSV`);

            // Create indexes
            await Sale.createIndexes();
            console.log('✅ Indexes created successfully');

            await mongoose.connection.close();
            console.log('✅ Database seeding completed successfully');
            resolve();
            process.exit(0);
          } catch (error) {
            console.error('Error inserting final batch:', error);
            reject(error);
            process.exit(1);
          }
        })
        .on('error', (error) => {
          console.error('Error reading CSV file:', error);
          reject(error);
          process.exit(1);
        });
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
