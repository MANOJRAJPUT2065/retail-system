# 📤 CSV Upload to MongoDB Guide

## ✅ System Overview

Your retail system has a complete CSV → MongoDB → Frontend pipeline:

```
CSV File (up to 1000 records)
    ↓
Frontend CSVUpload Component (validates file)
    ↓
Backend: POST /api/sales/upload-csv (multer handles)
    ↓
salesController.uploadCSV (processes)
    ↓
salesService.processCSVFile (parses CSV, validates, inserts)
    ↓
MongoDB: Sale.insertMany() (saves all records)
    ↓
Frontend: GET /api/sales?limit=10000 (fetches all)
    ↓
SalesPage displays ALL records
```

---

## 🔧 How It Works

### **Step 1: Frontend Upload**

- File: `frontend/src/components/CSVUpload.jsx`
- Validates: CSV only, max 1000 records
- Shows: File info (rows, size, name)
- Calls: `POST /api/sales/upload-csv`

### **Step 2: Backend Processing**

- File: `backend/src/services/salesService.js` → `processCSVFile()`
- Reads CSV with `csv-parser`
- Parses each row into Sale document
- Generates missing IDs automatically
- Validates data types
- Uses: `Sale.insertMany(results)`
- Returns: Success message with count

### **Step 3: MongoDB Save**

- Database: `retail_sales`
- Collection: `sales` (from Sale model)
- Inserts: Array of validated records
- Maintains: Timestamps, IDs, relationships

### **Step 4: Frontend Display**

- File: `frontend/src/pages/SalesPage.jsx`
- Fetches: `limit: 10000` (all records)
- Displays: In table with record count
- Filters: Can search/filter after load

---

## 📋 CSV File Format Required

Your CSV should have these columns:

```csv
customerName,phoneNumber,email,customerRegion,gender,age,productName,productCategory,quantity,pricePerUnit,discountPercentage,paymentMethod,orderStatus,tags,date
John Doe,9876543210,john@example.com,North,Male,30,Laptop,Electronics,1,50000,10,Credit Card,Completed,premium;electronics,2024-01-15
Jane Smith,9876543211,jane@example.com,South,Female,28,Phone,Electronics,2,30000,5,Debit Card,Completed,mobile,2024-01-16
```

**Required Columns:**

- customerName ✅
- phoneNumber ✅
- customerRegion ✅
- gender ✅
- productName ✅
- productCategory ✅
- quantity ✅
- pricePerUnit ✅

**Optional Columns:**

- email (defaults to '')
- discountPercentage (defaults to 0)
- paymentMethod (defaults to random)
- orderStatus (defaults to 'Completed')
- tags (split by semicolon)
- date (defaults to today)

---

## 🚀 Step-by-Step Upload Process

### **1. Start Both Servers**

Terminal 1 (Backend):

```bash
cd backend
npm run dev
```

Wait for: `Server is running on port 5000`

Terminal 2 (Frontend):

```bash
cd frontend
npm run dev
```

Wait for: `ready in XXXms`

### **2. Open Browser**

```
http://localhost:5173
```

### **3. Navigate to Tools**

- Click: **🛠️ Tools** in navbar
- Find: **📂 Bulk Upload via CSV**

### **4. Download Sample CSV**

- Click: **⬇️ Download Sample**
- Save the file
- Edit it with your data

### **5. Upload CSV**

- Drag & drop your CSV OR click to browse
- See: File info (rows, size, name)
- Click: **🚀 Upload & Process**
- Wait: Processing message
- See: ✅ Success with record count

### **6. View in Sales Page**

- Click: **💰 Sales** in navbar
- See: **📊 Total Records: X**
- See: All records in table
- Use: Search and filters

---

## ✅ Verification Checklist

### **Backend Started?**

```bash
curl http://localhost:5000/api/health
```

Should return:

```json
{ "status": "OK", "message": "Server is running" }
```

### **MongoDB Connected?**

Check backend console for:

```
MongoDB connected successfully
```

### **Database Exists?**

MongoDB Atlas → Collections → `retail_sales.sales`

### **Records Inserted?**

Check MongoDB:

```javascript
db.sales.find().count(); // Should show your record count
```

### **Frontend Displays Data?**

- Sales page shows total count
- Table has rows
- Data matches your CSV

---

## 🐛 Troubleshooting

### **"Cannot find module" Error**

- Fixed! Changed import from `sale.model` to `Sale`

### **CSV Not Uploading**

1. Check file is `.csv` format
2. Check file has ≤ 1000 records
3. Check column names match
4. Check backend is running
5. Check browser console for errors

### **Data Not Showing in Sales**

1. Check upload succeeded (green ✅)
2. Refresh Sales page (F5)
3. Check MongoDB has data
4. Check backend limit is 10000

### **"Too many records" Error**

1. CSV has > 1000 records
2. Split into multiple files
3. Upload each separately

### **MongoDB Connection Error**

1. Check internet connection
2. Check MongoDB URI in `.env` or `index.js`
3. Check database credentials
4. Check IP whitelisted in MongoDB Atlas

---

## 📊 Example Workflow

### **Your Dataset Upload:**

1. **CSV File:** `mydata.csv` (500 records)
2. **Upload:** ✅ Successfully imported 500 records
3. **MongoDB:** Data saved to `retail_sales.sales`
4. **Frontend:** Shows "📊 Total Records: 500"
5. **Sales Table:** Displays all 500 rows
6. **Filters:** Work on all 500 records

---

## 🎯 Key Endpoints

| Operation           | URL                          | Method |
| ------------------- | ---------------------------- | ------ |
| **Upload CSV**      | `/api/sales/upload-csv`      | POST   |
| **Get All Sales**   | `/api/sales?limit=10000`     | GET    |
| **Export Sales**    | `/api/sales/export/csv`      | GET    |
| **Get Filters**     | `/api/sales/filters`         | GET    |
| **Dashboard Stats** | `/api/sales/dashboard/stats` | GET    |

---

## 💾 Data Persistence

✅ **MongoDB Atlas** - Data persists forever
✅ **Automatic ID Generation** - Every record gets unique ID
✅ **Timestamps** - createdAt/updatedAt added
✅ **Backup Ready** - Database backed up by MongoDB

---

## 🔐 Security Features

✅ **File Validation** - Only CSV files
✅ **File Size Limit** - Max 10MB
✅ **Record Limit** - Max 1000 per upload
✅ **Input Sanitization** - Data validated
✅ **Error Handling** - Graceful failures

---

## ✨ Next Steps

After uploading CSV:

1. **View Sales:** See all records in Sales page
2. **Analyze:** Check Dashboard for insights
3. **Export:** Download filtered data as CSV
4. **Manage:** Edit, delete, filter records
5. **Track:** View orders and customer info

---

## 📞 Quick Commands

```bash
# Check backend running
curl http://localhost:5000/api/health

# Count records in MongoDB
mongo "mongodb+srv://user:pass@cluster0.qpxsllw.mongodb.net/retail_sales"
db.sales.countDocuments()

# Restart backend
npm run dev

# Restart frontend
npm run dev
```

---

**Everything is set up and ready!** Just:

1. ✅ Start backend (`npm run dev`)
2. ✅ Start frontend (`npm run dev`)
3. ✅ Upload your CSV from Tools page
4. ✅ View data in Sales page

**Bhai, ab sirf upload karna hai aur ho jayega!** 🚀
