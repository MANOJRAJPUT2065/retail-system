# Retail Sales Management System

## Overview

A comprehensive Retail Sales Management System built with MERN stack that enables efficient management and analysis of retail sales data. The system provides advanced search, filtering, sorting, and pagination capabilities to handle large volumes of transaction data with optimal performance and user experience.

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React, React Router, Axios, CSS3
- **Database**: MongoDB (MongoDB Atlas)
- **Development Tools**: Concurrently (for running both servers), Vite (frontend build tool)

## Search Implementation Summary

### How It Works:

1. **Frontend**: User types in search bar → `SearchBar` component captures input
2. **Debouncing**: Input is debounced (300ms delay) using `debounce.js` utility to reduce API calls
3. **State Update**: `useSales` hook updates search filter state
4. **API Call**: Request sent to `/api/sales` with `search` query parameter
5. **Backend Processing**:
   - `salesController.js` extracts search parameter
   - `queryBuilder.js` builds MongoDB query with `$or` operator
   - Uses regex with case-insensitive flag: `{ $regex: search, $options: 'i' }`
   - Searches across `customerName` and `phoneNumber` fields
6. **Database Query**: MongoDB executes query with text indexes for optimal performance
7. **Response**: Filtered results returned with pagination info

### Key Features:

- Case-insensitive search (works with uppercase/lowercase)
- Searches both Customer Name and Phone Number simultaneously
- Works seamlessly with filters, sorting, and pagination
- Debounced to prevent excessive API calls

**Files Involved:**

- `frontend/src/components/SearchBar.jsx` - UI component
- `frontend/src/utils/debounce.js` - Debounce utility
- `frontend/src/hooks/useSales.js` - State management
- `backend/src/utils/queryBuilder.js` - Query building logic
- `backend/src/models/Sale.js` - Database indexes

## Filter Implementation Summary

### How It Works:

1. **Filter Options Loading**: On page load, `useFilterOptions` hook fetches available filter values from `/api/sales/filters`
2. **Backend Aggregation**: `salesService.js` uses MongoDB `distinct()` to get unique values for each filter field
3. **Multi-Select Filters**:
   - Customer Region, Gender, Product Category, Tags, Payment Method
   - Implemented as checkboxes in `FilterPanel.jsx`
   - State managed as arrays in `useSales` hook
   - Backend uses `$in` operator: `{ field: { $in: [value1, value2] } }`
4. **Range Filters**:
   - Age Range: Min/Max number inputs
   - Date Range: From/To date inputs
   - Backend uses `$gte` (greater than or equal) and `$lte` (less than or equal) operators
5. **Query Building**: `queryBuilder.js` combines all active filters using AND logic
6. **State Preservation**: All filter states preserved during pagination and sorting

### Filter Types:

- **Customer Region**: Multi-select checkbox (North, South, East, West, Central)
- **Gender**: Multi-select checkbox (Male, Female, Other)
- **Age Range**: Number inputs (Min: 18, Max: 100)
- **Product Category**: Multi-select checkbox (Electronics, Clothing, etc.)
- **Tags**: Multi-select checkbox (organic, skincare, portable, etc.)
- **Payment Method**: Multi-select checkbox (UPI, Credit Card, Cash, etc.)
- **Date Range**: Date inputs (From date to To date)

**Files Involved:**

- `frontend/src/components/FilterPanel.jsx` - Filter UI
- `frontend/src/hooks/useFilterOptions.js` - Fetch filter options
- `frontend/src/hooks/useSales.js` - Filter state management
- `backend/src/utils/queryBuilder.js` - Filter query building
- `backend/src/services/salesService.js` - Filter options aggregation

## Sorting Implementation Summary

### How It Works:

1. **UI Control**: `SortDropdown` component provides two dropdowns:
   - Sort By: Date, Quantity, Customer Name
   - Sort Order: Ascending, Descending
2. **State Management**: Selected sort options stored in `useSales` hook
3. **API Request**: Sort parameters sent as `sortBy` and `sortOrder` query params
4. **Backend Processing**: `queryBuilder.js` `buildSort()` function creates MongoDB sort object
5. **Database Sort**: MongoDB applies sort before pagination
6. **State Preservation**: Sort state maintained with search and filters

### Sort Options:

- **Date**: Default "Newest First" (descending), can switch to ascending
- **Quantity**: Sort by product quantity (ascending/descending)
- **Customer Name**: Alphabetical sort (A-Z or Z-A)

**Files Involved:**

- `frontend/src/components/SortDropdown.jsx` - Sort UI
- `frontend/src/hooks/useSales.js` - Sort state
- `backend/src/utils/queryBuilder.js` - Sort logic
- `backend/src/services/salesService.js` - Query execution

## Pagination Implementation Summary

### How It Works:

1. **Fixed Page Size**: 10 items per page (hardcoded in `useSales` hook)
2. **Navigation**: Previous/Next buttons in `Pagination` component
3. **State Management**: Current page number tracked in `useSales` hook
4. **API Request**: `page` and `limit` parameters sent to backend
5. **Backend Processing**:
   - `salesService.js` calculates `skip = (page - 1) * limit`
   - Uses MongoDB `skip()` and `limit()` for pagination
   - Also calculates total count for pagination metadata
6. **Response**: Returns sales array + pagination object with:
   - `currentPage`, `totalPages`, `totalItems`, `hasNextPage`, `hasPrevPage`
7. **State Preservation**: All search, filter, and sort states preserved during page navigation

### Pagination Features:

- Previous button disabled on first page
- Next button disabled on last page
- Displays "Page X of Y" information
- All filters/search/sort preserved when changing pages

**Files Involved:**

- `frontend/src/components/Pagination.jsx` - Pagination UI
- `frontend/src/hooks/useSales.js` - Page state management
- `backend/src/services/salesService.js` - Pagination logic

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB installation)
- npm or yarn

### Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd RETAIL
```

2. **Install dependencies:**

```bash
npm run install:all
```

This installs dependencies for root, backend, and frontend.

3. **Set up environment variables:**

   - Create `backend/.env` file:

   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/retail_sales
   NODE_ENV=development
   ```

   - For MongoDB Atlas: Replace `username`, `password`, and `cluster` with your credentials
   - Password with special characters should be URL encoded (e.g., `@` becomes `%40`)

4. **Seed the database:**

```bash
cd backend
npm run seed
```

This will:

- Connect to MongoDB
- Clear existing data
- Read `truestate_assignment_dataset.csv` file
- Parse and insert data in batches of 1000 records
- Create database indexes
- Display progress and completion message

**Note**: For large datasets, use: `node --max-old-space-size=4096 src/utils/seedData.js`

5. **Start the development servers:**

```bash
# From root directory
npm run dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Start backend in production mode
cd backend
npm start
```

## Implementation Details

### Backend Architecture

**Entry Point**: `backend/src/index.js`

- Sets up Express server
- Connects to MongoDB using Mongoose
- Configures CORS middleware
- Registers routes
- Error handling middleware

**Routes**: `backend/src/routes/sales.js`

- `GET /api/sales` - Get paginated sales with filters
- `GET /api/sales/filters` - Get available filter options

**Controllers**: `backend/src/controllers/salesController.js`

- Extracts query parameters from request
- Validates and parses parameters (arrays, numbers, dates)
- Calls service layer
- Returns JSON response with error handling

**Services**: `backend/src/services/salesService.js`

- `getSales()`: Builds query, applies sorting, pagination, returns results
- `getFilterOptions()`: Aggregates unique values for filter dropdowns

**Query Builder**: `backend/src/utils/queryBuilder.js`

- `buildQuery()`: Constructs MongoDB query from filter parameters
- `buildSort()`: Creates sort object based on sortBy and sortOrder
- Handles all filter types: multi-select, ranges, dates

**Models**: `backend/src/models/Sale.js`

- Defines MongoDB schema with all 25 required fields
- Creates indexes for performance:
  - Text index on customerName and phoneNumber (for search)
  - Single field indexes on frequently filtered fields
  - Date index for sorting

**Seed Data**: `backend/src/utils/seedData.js`

- Reads CSV file using `csv-parser`
- Parses each row and maps to Sale schema
- Handles tags (comma-separated to array)
- Inserts data in batches of 1000 to avoid memory issues
- Creates indexes after insertion

### Frontend Architecture

**Entry Point**: `frontend/src/main.jsx`

- Renders React app
- Sets up React Router

**App Component**: `frontend/src/App.jsx`

- Defines routes
- Main route: `/` → `SalesPage`

**Main Page**: `frontend/src/pages/SalesPage.jsx`

- Orchestrates all components
- Manages filter panel visibility
- Handles search, filter, sort, pagination events
- Displays loading/error states

**Components**:

- `SearchBar.jsx`: Search input with debouncing
- `FilterPanel.jsx`: All 7 filters with multi-select/range inputs
- `SortDropdown.jsx`: Sort field and order selection
- `SalesTable.jsx`: Displays sales data in formatted table
- `Pagination.jsx`: Previous/Next navigation

**Hooks**:

- `useSales.js`: Main data fetching hook
  - Manages sales data, pagination, loading, error states
  - Handles filter/search/sort state
  - Fetches data from API when state changes
  - Resets page to 1 when filters change
- `useFilterOptions.js`: Fetches available filter values on mount

**Services**: `frontend/src/services/api.js`

- Axios instance configured with base URL
- `getSales()`: Fetches paginated sales with filters
- `getFilterOptions()`: Fetches filter dropdown options

**Styles**: Component-specific CSS files for each component

### Data Flow

1. **User Action** (e.g., types in search, selects filter)
2. **Component Event Handler** updates state in hook
3. **Hook State Change** triggers `useEffect` in `useSales`
4. **API Call** made via `salesAPI.getSales()` with all parameters
5. **Vite Proxy** forwards `/api/*` to `http://localhost:5000`
6. **Backend Route** receives request
7. **Controller** extracts and validates parameters
8. **Service** calls `queryBuilder` to build MongoDB query
9. **MongoDB** executes query with indexes
10. **Response** flows back: Service → Controller → Route → Frontend
11. **Hook** updates state with new data
12. **React Re-renders** components with updated data

### Database Schema

All 25 fields from assignment requirements:

- **Customer**: customerId, customerName, phoneNumber, gender, age, customerRegion, customerType
- **Product**: productId, productName, brand, productCategory, tags (array)
- **Sales**: quantity, pricePerUnit, discountPercentage, totalAmount, finalAmount
- **Operational**: date, paymentMethod, orderStatus, deliveryType, storeId, storeLocation, salespersonId, employeeName

### Error Handling

**Backend**:

- Try-catch blocks in controllers and services
- Error middleware for unhandled errors
- Returns appropriate HTTP status codes

**Frontend**:

- Try-catch in hooks
- Error state displayed in UI
- Loading states during API calls
- Empty state when no results found

### Performance Optimizations

**Backend**:

- MongoDB indexes on frequently queried fields
- Batch insertion for seed data (1000 records at a time)
- Efficient query building (only active filters included)
- Pagination limits data transfer

**Frontend**:

- Debounced search (300ms delay)
- React hooks for efficient re-renders
- Component-based architecture
- CSS for styling (no heavy libraries)

## Project Structure

```
RETAIL/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── salesController.js
│   │   ├── services/
│   │   │   └── salesService.js
│   │   ├── routes/
│   │   │   └── sales.js
│   │   ├── models/
│   │   │   └── Sale.js
│   │   ├── utils/
│   │   │   ├── queryBuilder.js
│   │   │   └── seedData.js
│   │   └── index.js
│   ├── truestate_assignment_dataset.csv
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchBar.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── SortDropdown.jsx
│   │   │   ├── SalesTable.jsx
│   │   │   └── Pagination.jsx
│   │   ├── pages/
│   │   │   └── SalesPage.jsx
│   │   ├── hooks/
│   │   │   ├── useSales.js
│   │   │   └── useFilterOptions.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── debounce.js
│   │   ├── styles/
│   │   │   ├── index.css
│   │   │   ├── SalesPage.css
│   │   │   ├── SearchBar.css
│   │   │   ├── FilterPanel.css
│   │   │   ├── SortDropdown.css
│   │   │   ├── SalesTable.css
│   │   │   └── Pagination.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── README.md
├── docs/
│   └── architecture.md
├── package.json
└── README.md
```

## Testing the Application

1. **Search**: Type customer name or phone number in search bar
2. **Filters**: Select multiple regions, genders, categories, etc.
3. **Sorting**: Change sort field and order
4. **Pagination**: Click Previous/Next buttons
5. **Combinations**: Try search + filters + sorting + pagination together

All features work independently and in combination, with state preserved across operations.
