const path = require('path');
const { detectCSVSchema, getColumnMapping, compareSchemas, logSchemaComparison } = require('../utils/schemaSync');
const Sale = require('../models/Sale');

const TEST_CSV = path.join(__dirname, '../../uploads/test_new_colu-mns.csv');

const testSchemaDetection = async () => 
{
  console.log('\n🔍 Testing Dynamic Schema Detection\n');
  console.log('=' .repeat(60));
  
  try {
    // Detect schema from test CSV
    console.log('\n📂 Analyzing test CSV file...');
    const detectedSchema = await detectCSVSchema(TEST_CSV);
    
    console.log('\n📋 Detected Schema:');
    console.log(JSON.stringify(detectedSchema, null, 2));
    
    // Get column mapping
    const columnMapping = getColumnMapping(detectedSchema);
    console.log('\n   Column Mapping:');
    console.log(JSON.stringify(columnMapping, null, 2));
    
    // Compare with existing model
    const existingSchema = Sale.schema.paths;
    const comparison = compareSchemas(detectedSchema, existingSchema);
    
    console.log('\n📊 Schema Comparison:');
    logSchemaComparison(comparison);
    
    console.log('=' .repeat(60));
    console.log('✅ Test completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testSchemaDetection();
