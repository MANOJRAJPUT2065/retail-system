# Backend API

## Overview
Express.js backend API for the Retail Sales Management System.

## Endpoints

### GET /api/sales
Get paginated sales data with search, filter, sort, and pagination support.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term for Customer Name or Phone Number
- `regions` - Comma-separated list of regions
- `genders` - Comma-separated list of genders
- `ageMin` - Minimum age
- `ageMax` - Maximum age
- `categories` - Comma-separated list of product categories
- `tags` - Comma-separated list of tags
- `paymentMethods` - Comma-separated list of payment methods
- `dateFrom` - Start date (YYYY-MM-DD)
- `dateTo` - End date (YYYY-MM-DD)
- `sortBy` - Sort field (date, quantity, customerName)
- `sortOrder` - Sort order (asc, desc)

**Example:**
```
GET /api/sales?page=1&limit=10&search=john&regions=North,South&sortBy=date&sortOrder=desc
```

### GET /api/sales/filters
Get available filter options (regions, genders, categories, tags, payment methods).

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`

3. Seed the database:
```bash
npm run seed
```

4. Start the server:
```bash
npm run dev
```

