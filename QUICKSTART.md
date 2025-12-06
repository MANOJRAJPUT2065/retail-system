# Quick Start Guide

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Setup Steps

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Configure Environment

Create `backend/.env` file:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/retail_sales
NODE_ENV=development
```

For MongoDB Atlas, use:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/retail_sales
```

### 3. Seed Database

```bash
cd backend
npm run seed
```

This will create 500 sample sales records.

### 4. Start Development Servers

From the root directory:

```bash
npm run dev
```

This starts both:

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## Testing the Connection

1. Open http://localhost:3000 in your browser
2. You should see the sales data table
3. Try searching, filtering, sorting, and pagination

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/sales` - Get sales with filters
- `GET /api/sales/filters` - Get filter options

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running locally, or
- Update `MONGODB_URI` in `backend/.env` with correct connection string

### Port Already in Use

- Change `PORT` in `backend/.env`
- Update `vite.config.js` proxy target if backend port changes

### Frontend Not Loading

- Check if backend is running on port 5000
- Check browser console for errors
- Verify Vite dev server started successfully
