const fs = require('fs');
const csv = require('csv-parser');

/**
 * Auto-detect data types from CSV values
 */
const detectDataType = (values) => {
  const samples = values.filter(v => v !== null && v !== undefined && String(v).trim() !== '').slice(0, 100);
  
  if (samples.length === 0) return { type: String, default: '' };

  // Check if all are numbers
  const numbers = samples.filter(v => !isNaN(parseFloat(v)) && isFinite(v));
  if (numbers.length / samples.length > 0.8) {
    const hasDecimals = numbers.some(v => String(v).includes('.'));
    return { 
      type: Number, 
      default: 0,
      isInteger: !hasDecimals 
    };
  }

  // Check if all are dates
  const dates = samples.filter(v => !isNaN(Date.parse(v)));
  if (dates.length / samples.length > 0.8) {
    return { type: Date, default: new Date() };
  }

  // Check if all are booleans
  const booleans = samples.filter(v => 
    ['true', 'false', '0', '1', 'yes', 'no'].includes(String(v).toLowerCase())
  );
  if (booleans.length / samples.length > 0.8) {
    return { type: Boolean, default: false };
  }

  // Default to String
  return { type: String, default: '' };
};

/**
 * Scan CSV file and detect all columns with their data types
 */
const detectCSVSchema = (csvFilePath) => {
  return new Promise((resolve, reject) => {
    const columnData = {};
    let rowCount = 0;

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        rowCount++;
        
        // Collect values for each column
        Object.keys(row).forEach(column => {
          if (!columnData[column]) {
            columnData[column] = [];
          }
          columnData[column].push(row[column]);
        });

        // Limit sampling to first 1000 rows for performance
        if (rowCount >= 1000) {
          return;
        }
      })
      .on('end', () => {
        const schema = {};
        
        Object.keys(columnData).forEach(column => {
          const dataType = detectDataType(columnData[column]);
          
          // Normalize column names (camelCase)
          const fieldName = column
            .trim()
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .split(/\s+/)
            .map((word, index) => {
              if (index === 0) return word.toLowerCase();
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join('');

          schema[fieldName] = {
            originalName: column,
            type: dataType.type.name,
            required: false,
            default: dataType.default,
            isInteger: dataType.isInteger || false
          };
        });

        console.log(`✅ Detected ${Object.keys(schema).length} columns from CSV`);
        resolve(schema);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

/**
 * Get mapping between CSV column names and schema field names
 */
const getColumnMapping = (csvSchema) => {
  const mapping = {};
  Object.keys(csvSchema).forEach(fieldName => {
    mapping[csvSchema[fieldName].originalName] = fieldName;
  });
  return mapping;
};

/**
 * Compare detected schema with existing model schema
 */
const compareSchemas = (detectedSchema, existingSchema) => {
  const newFields = [];
  const existingFields = Object.keys(existingSchema);

  Object.keys(detectedSchema).forEach(fieldName => {
    if (!existingFields.includes(fieldName)) {
      newFields.push({
        name: fieldName,
        type: detectedSchema[fieldName].type,
        originalName: detectedSchema[fieldName].originalName
      });
    }
  });

  return {
    newFields,
    hasNewFields: newFields.length > 0
  };
};

/**
 * Log schema comparison results
 */
const logSchemaComparison = (comparison) => {
  if (comparison.hasNewFields) {
    console.log('\n🆕 New columns detected in CSV:');
    comparison.newFields.forEach(field => {
      console.log(`   📌 ${field.originalName} → ${field.name} (${field.type})`);
    });
    console.log('✅ These columns will be automatically saved!\n');
  } else {
    console.log('✅ All CSV columns match existing schema\n');
  }
};

module.exports = {
  detectCSVSchema,
  getColumnMapping,
  compareSchemas,
  logSchemaComparison,
  detectDataType
};
