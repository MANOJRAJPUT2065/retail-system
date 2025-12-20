import { useState, useRef } from 'react';
import '../styles/CSVUpload.css';

const CSVUpload = ({ onUpload, type = 'sales' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const fileInputRef = useRef(null);

  const MAX_RECORDS = 1000; // Maximum records per upload
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    return lines.length - 1; // Subtract header row
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (uploadedFile) => {
    setFileInfo(null);
    setResult(null);

    // Validate file type
    if (uploadedFile.type !== 'text/csv' && !uploadedFile.name.endsWith('.csv')) {
      setResult({ success: false, message: '❌ Only CSV files allowed' });
      return;
    }

    // Validate file size
    if (uploadedFile.size > MAX_FILE_SIZE) {
      setResult({ 
        success: false, 
        message: `❌ File too large! Max ${MAX_FILE_SIZE / 1024 / 1024}MB allowed` 
      });
      return;
    }

    // Read and validate row count
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rowCount = parseCSV(text);

        if (rowCount === 0) {
          setResult({ success: false, message: '❌ CSV file is empty' });
          return;
        }

        if (rowCount > MAX_RECORDS) {
          setResult({ 
            success: false, 
            message: `❌ Too many records! (${rowCount} found, max ${MAX_RECORDS} allowed). Please split into multiple files.` 
          });
          return;
        }

        setFile(uploadedFile);
        setFileInfo({
          rows: rowCount,
          size: (uploadedFile.size / 1024).toFixed(2),
          name: uploadedFile.name
        });
      } catch (error) {
        setResult({ success: false, message: '❌ Error reading file' });
      }
    };
    reader.readAsText(uploadedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await onUpload(formData);
      setResult({
        success: true,
        message: response.message || 'File uploaded successfully',
        count: response.count
      });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.error || 'Upload failed'
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadSample = () => {
    const sampleData = type === 'sales' 
      ? 'customerName,phoneNumber,email,customerRegion,gender,age,productName,productCategory,quantity,pricePerUnit,discountPercentage,paymentMethod,orderStatus,tags,date\nJohn Doe,9876543210,john@example.com,North,Male,30,Laptop,Electronics,1,50000,10,Credit Card,Completed,premium;electronics,2024-01-15\n'
      : 'name,category,price,stock,description\nLaptop,Electronics,50000,10,High-performance laptop\n';
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample_${type}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="csv-upload-container">
      <div className="csv-upload-header">
        <h3>📂 Bulk Upload via CSV</h3>
        <button className="sample-btn" onClick={downloadSample}>
          ⬇️ Download Sample
        </button>
      </div>

      <div
        className={`csv-dropzone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        
        <div className="dropzone-content">
          <div className="upload-icon">📤</div>
          <h4>Drag & Drop CSV File</h4>
          <p>max {MAX_RECORDS} records per upload</p>
          {fileInfo && (
            <div className="file-info">
              <span className="info-item">📄 {fileInfo.name}</span>
              <span className="info-item">📊 {fileInfo.rows} rows</span>
              <span className="info-item">💾 {fileInfo.size} KB</span>
            </div>
          )}
          {file && (
            <div className="selected-file">
              <span className="file-icon">✅</span>
              <span className="file-name">Ready to upload</span>
            </div>
          )}
        </div>
      </div>

      {file && (
        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <span className="spinner-small"></span>
              Uploading...
            </>
          ) : (
            <>
              <span>🚀</span>
              Upload & Process
            </>
          )}
        </button>
      )}

      {result && (
        <div className={`upload-result ${result.success ? 'success' : 'error'}`}>
          <span className="result-icon">
            {result.success ? '✅' : '❌'}
          </span>
          <div className="result-content">
            <div className="result-message">{result.message}</div>
            {result.count && (
              <div className="result-count">
                {result.count} records processed
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVUpload;
