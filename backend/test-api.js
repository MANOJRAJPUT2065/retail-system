#!/usr/bin/env node

/**
 * Quick Order API Tester
 * Run this file to test if the API is working:
 * node test-api.js
 */

const http = require('http');

const testData = {
  customerName: 'Test Customer',
  phoneNumber: '9876543210',
  email: 'test@example.com',
  customerRegion: 'North',
  gender: 'Male',
  age: 30,
  paymentMethod: 'Credit Card',
  items: [
    {
      productName: 'Test Product',
      productCategory: 'Electronics',
      quantity: 1,
      pricePerUnit: 100,
      discountPercentage: 10,
      totalAmount: 100,
      finalAmount: 90
    }
  ]
};

function makeRequest() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/sales/quick-order',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(testData))
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\n✅ Response received!');
      console.log('Status Code:', res.statusCode);
      console.log('Response:', JSON.parse(data));
      
      if (res.statusCode === 201) {
        console.log('\n✅ Quick Order API is working correctly!');
      } else {
        console.log('\n❌ API returned an error. Check the response above.');
      }
    });
  });

  req.on('error', (error) => {
    console.error('\n❌ Error: Cannot connect to backend at http://localhost:5000');
    console.error('Make sure the backend server is running with: npm run dev');
    console.error('\nFull error:', error.message);
  });

  console.log('Testing Quick Order API...');
  console.log('POST http://localhost:5000/api/sales/quick-order');
  console.log('Data:', JSON.stringify(testData, null, 2));

  req.write(JSON.stringify(testData));
  req.end();
}

// Run the test
makeRequest();
