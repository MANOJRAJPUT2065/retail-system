# Architecture Documentation

## System Overview

The Retail Sales Management System is a full-stack application built with React (frontend) and Express.js (backend), using MongoDB as the database. The system follows a clean, modular architecture with clear separation of concerns between presentation, business logic, and data layers.

## Backend Architecture

### Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Port**: 5000 (default)
- **Additional Packages**: csv-parser (for CSV data import), dotenv (for environment variables)

### Folder Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   │   └── salesController.js
│   ├── services/        # Business logic
│   │   └── salesService.js
│   ├── routes/          # API route definitions
│   │   └── sales.js
│   ├── models/          # Database schemas
│   │   └── Sale.js
│   ├── utils/           # Utility functions
│   │   ├── queryBuilder.js
│   │   └── seedData.js
│   └── index.js         # Application entry point
├── truestate_assignment_dataset.csv
├── package.json
└── README.md
```

### Module Responsibilities

#### Controllers (`controllers/salesController.js`)

**Purpose**: Handle HTTP requests and responses

**Responsibilities**:

- Extract query parameters from incoming requests
- Parse and validate parameters (convert strings to arrays, numbers, dates)
- Call service layer methods with processed parameters
- Return formatted JSON responses
- Handle errors and send appropriate HTTP status codes (500 for server errors)
- Log errors for debugging

**Key Functions**:

- `getSales(req, res)`: Handles GET `/api/sales` requests
- `getFilterOptions(req, res)`: Handles GET `/api/sales/filters` requests

#### Services (`services/salesService.js`)

**Purpose**: Implement core business logic

**Responsibilities**:

- Build MongoDB queries using `queryBuilder` utility
- Execute database queries with proper sorting and pagination
- Aggregate data for filter options (unique values, min/max ranges)
- Transform data if needed before returning
- Handle database errors and throw meaningful error messages

**Key Functions**:

- `getSales(page, limit, filters)`: Fetches paginated sales data
  - Uses `buildQuery()` to create MongoDB query
  - Uses `buildSort()` to create sort object
  - Calculates skip/limit for pagination
  - Returns sales array + pagination metadata
- `getFilterOptions()`: Fetches available filter values
  - Uses `distinct()` for unique values
  - Uses `aggregate()` for age range (min/max)
  - Flattens tags array and removes duplicates

#### Routes (`routes/sales.js`)

**Purpose**: Define API endpoints

**Responsibilities**:

- Map URL paths to controller functions
- Define HTTP methods (GET, POST, etc.)
- Apply middleware if needed (authentication, validation)

**Endpoints**:

- `GET /` → `salesController.getSales`
- `GET /filters` → `salesController.getFilterOptions`

#### Models (`models/Sale.js`)

**Purpose**: Define database schema and indexes

**Responsibilities**:

- Define MongoDB schema with all 25 required fields
- Set field types and validation rules
- Create database indexes for performance:
  - Text index on `customerName` and `phoneNumber` (for search)
  - Single field indexes on `customerRegion`, `gender`, `productCategory`, `paymentMethod`
  - Date index on `date` field (for sorting and date range queries)
- Enable timestamps (createdAt, updatedAt)

**Schema Fields**:

- Customer: customerId, customerName, phoneNumber, gender, age, customerRegion, customerType
- Product: productId, productName, brand, productCategory, tags (array)
- Sales: quantity, pricePerUnit, discountPercentage, totalAmount, finalAmount
- Operational: date, paymentMethod, orderStatus, deliveryType, storeId, storeLocation, salespersonId, employeeName

#### Utils (`utils/`)

**queryBuilder.js**:

- `buildQuery(filters)`: Constructs MongoDB query object from filter parameters
  - Handles search with `$or` operator and regex
  - Handles multi-select filters with `$in` operator
  - Handles range filters with `$gte` and `$lte` operators
  - Handles date range with proper time boundaries
- `buildSort(sortBy, sortOrder)`: Creates MongoDB sort object
  - Maps sortBy values to database fields
  - Converts sortOrder string to number (1 for asc, -1 for desc)

**seedData.js**:

- Reads CSV file using `csv-parser`
- Parses each row and maps CSV columns to Sale schema fields
- Handles data type conversions (strings to numbers, dates, arrays)
- Inserts data in batches of 1000 records to avoid memory issues
- Creates indexes after data insertion
- Provides progress logging during insertion

### API Endpoints

#### GET `/api/sales`

Retrieves paginated sales data with support for search, filtering, sorting, and pagination.

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term for customer name or phone number
- `regions` (string): Comma-separated list of regions
- `genders` (string): Comma-separated list of genders
- `ageMin` (number): Minimum age
- `ageMax` (number): Maximum age
- `categories` (string): Comma-separated list of product categories
- `tags` (string): Comma-separated list of tags
- `paymentMethods` (string): Comma-separated list of payment methods
- `dateFrom` (string): Start date (YYYY-MM-DD)
- `dateTo` (string): End date (YYYY-MM-DD)
- `sortBy` (string): Sort field (date, quantity, customerName)
- `sortOrder` (string): Sort order (asc, desc)

**Response:**

```json
{
  "sales": [
    {
      "_id": "...",
      "customerId": "CUST-40823",
      "customerName": "Neha Khan",
      "phoneNumber": "9720639364",
      "gender": "Male",
      "age": 21,
      "customerRegion": "East",
      "productName": "Herbal Face Wash",
      "productCategory": "Beauty",
      "quantity": 5,
      "finalAmount": 18779.2,
      "date": "2023-03-23T00:00:00.000Z",
      ...
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 50,
    "totalItems": 500,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### GET `/api/sales/filters`

Returns available filter options for the UI dropdowns.

**Response:**

```json
{
  "regions": ["Central", "East", "North", "South", "West"],
  "genders": ["Female", "Male", "Other"],
  "categories": ["Beauty", "Books", "Clothing", "Electronics", ...],
  "tags": ["casual", "fashion", "gadgets", "organic", ...],
  "paymentMethods": ["Cash", "Credit Card", "Debit Card", "Net Banking", "UPI", "Wallet"],
  "ageRange": {
    "minAge": 18,
    "maxAge": 78
  }
}
```

### Data Flow

1. **HTTP Request** → Express server receives request
2. **Middleware** → CORS, JSON parsing applied
3. **Route Matching** → Express router matches URL to route handler
4. **Controller** → Extracts and validates query parameters
   - Parses comma-separated strings to arrays
   - Converts strings to numbers/dates
   - Sets default values
5. **Service** → Builds query using `queryBuilder.buildQuery()`
   - Combines all active filters
   - Creates sort object using `queryBuilder.buildSort()`
6. **Model** → Executes MongoDB query
   - Uses indexes for optimal performance
   - Applies sorting
   - Applies pagination (skip/limit)
7. **Response** → Returns JSON with sales data and pagination info
8. **Error Handling** → If error occurs, returns 500 status with error message

### Database Indexes

The system uses MongoDB indexes for optimal query performance:

- **Text Index**: `{ customerName: 'text', phoneNumber: 'text' }` - For search functionality
- **Single Field Indexes**:
  - `customerRegion: 1` - For region filtering
  - `gender: 1` - For gender filtering
  - `productCategory: 1` - For category filtering
  - `paymentMethod: 1` - For payment method filtering
- **Date Index**: `date: -1` - For date sorting and date range queries

Indexes are created automatically when the schema is loaded and explicitly after data seeding.

## Frontend Architecture

### Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router
- **HTTP Client**: Axios
- **Port**: 3000 (default)
- **Styling**: CSS3 (component-specific stylesheets)

### Folder Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── SearchBar.jsx
│   │   ├── FilterPanel.jsx
│   │   ├── SortDropdown.jsx
│   │   ├── SalesTable.jsx
│   │   └── Pagination.jsx
│   ├── pages/          # Page components
│   │   └── SalesPage.jsx
│   ├── hooks/          # Custom React hooks
│   │   ├── useSales.js
│   │   └── useFilterOptions.js
│   ├── services/       # API service layer
│   │   └── api.js
│   ├── utils/          # Utility functions
│   │   └── debounce.js
│   ├── styles/         # CSS stylesheets
│   │   ├── index.css
│   │   ├── SalesPage.css
│   │   ├── SearchBar.css
│   │   ├── FilterPanel.css
│   │   ├── SortDropdown.css
│   │   ├── SalesTable.css
│   │   └── Pagination.css
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Application entry point
├── public/
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

### Component Hierarchy

```
App (App.jsx)
└── SalesPage (pages/SalesPage.jsx)
    ├── SearchBar (components/SearchBar.jsx)
    ├── SortDropdown (components/SortDropdown.jsx)
    ├── FilterPanel (components/FilterPanel.jsx)
    │   ├── Multiple Filter Groups
    │   └── Reset Button
    ├── SalesTable (components/SalesTable.jsx)
    └── Pagination (components/Pagination.jsx)
```

### Module Responsibilities

#### Pages (`pages/SalesPage.jsx`)

**Purpose**: Main page component that orchestrates all features

**Responsibilities**:

- Integrate all child components (SearchBar, FilterPanel, SortDropdown, SalesTable, Pagination)
- Manage filter panel visibility state
- Handle user interaction events (search, filter, sort, pagination)
- Display loading and error states
- Show empty state when no results found
- Coordinate between components using hooks

**State Management**:

- Uses `useSales` hook for data fetching and state
- Uses `useFilterOptions` hook for filter dropdown values
- Local state for UI (filter panel visibility)

#### Components (`components/`)

**SearchBar.jsx**:

- Renders search input field
- Implements debouncing (300ms delay) to reduce API calls
- Updates search state in parent via callback
- Displays current search value

**FilterPanel.jsx**:

- Displays all 7 filter types
- Multi-select filters: Checkboxes for regions, genders, categories, tags, payment methods
- Range filters: Number inputs for age, date inputs for date range
- Handles filter changes and updates parent state
- Provides "Reset All" button to clear all filters
- Shows loading state while fetching filter options

**SortDropdown.jsx**:

- Two dropdowns: Sort By (field) and Sort Order (asc/desc)
- Updates sort state in parent via callback
- Displays current sort selection

**SalesTable.jsx**:

- Displays sales data in tabular format
- Formats dates using `toLocaleDateString()`
- Formats currency using `Intl.NumberFormat()`
- Shows order status with color-coded badges
- Responsive design for different screen sizes

**Pagination.jsx**:

- Previous/Next navigation buttons
- Displays current page and total pages
- Disables buttons when at first/last page
- Updates page state in parent via callback

#### Hooks (`hooks/`)

**useSales.js**:

- **State Management**: Manages sales data, pagination, loading, error, filters, search, sort, page
- **Data Fetching**: Fetches data from API when filters/search/sort/page changes
- **State Updates**: Provides functions to update filters, search, sort, page
- **Reset Function**: Resets all filters to default values
- **Effect Hook**: Automatically fetches data when dependencies change
- **Parameter Building**: Converts filter arrays to comma-separated strings for API
- **Error Handling**: Catches and stores errors for UI display

**useFilterOptions.js**:

- **Data Fetching**: Fetches filter options on component mount
- **State Management**: Manages filter options, loading, error states
- **Effect Hook**: Fetches options once when component mounts
- **Error Handling**: Catches and stores errors

#### Services (`services/api.js`)

**Purpose**: Centralized API client configuration

**Responsibilities**:

- Create Axios instance with base URL
- Configure default headers
- Export API functions for data fetching
- Handle environment-specific URLs (development vs production)

**Functions**:

- `getSales(params)`: Fetches paginated sales with all filter/search/sort parameters
- `getFilterOptions()`: Fetches available filter values

#### Utils (`utils/debounce.js`)

**Purpose**: Reduce API calls during search

**Implementation**:

- Creates debounced function that delays execution
- Clears previous timeout on each call
- Executes function after specified delay (300ms)
- Prevents excessive API calls while user is typing

### State Management

The application uses React hooks for state management:

1. **Local Component State**:

   - UI-specific state (e.g., filter panel visibility in SalesPage)
   - Managed with `useState` hook

2. **Custom Hooks**:

   - Complex state logic in `useSales` and `useFilterOptions`
   - Encapsulates data fetching, state updates, side effects

3. **State Flow**:
   - User interaction → Component event handler → Hook state update → useEffect triggers → API call → State update → Re-render

### Data Flow

1. **User Interaction** → Component event handler (e.g., onChange in SearchBar)
2. **State Update** → Hook function called (e.g., `updateFilters()` in useSales)
3. **Effect Trigger** → `useEffect` in useSales detects state change
4. **API Call** → `salesAPI.getSales()` called with all parameters
5. **Vite Proxy** → In development, Vite proxy forwards `/api/*` to `http://localhost:5000`
6. **Backend Request** → Axios sends HTTP GET request with query parameters
7. **Backend Processing** → Backend processes request (see Backend Data Flow)
8. **Response** → JSON response received
9. **State Update** → Hook updates state with new data
10. **Re-render** → React re-renders components with updated data

### Search Implementation

**Frontend**:

- Real-time search as user types
- Debounced to reduce API calls (300ms delay)
- Searches across `customerName` and `phoneNumber` fields
- State preserved with filters and sorting

**Backend**:

- Case-insensitive regex matching using MongoDB `$regex` with `$options: 'i'`
- Uses `$or` operator to search both fields simultaneously
- Text indexes on search fields for optimal performance

### Filter Implementation

**Frontend**:

- Multi-select filters: Checkboxes for categorical data
- Range filters: Number/date inputs for numeric/temporal data
- All filters work independently and in combination
- State preserved across pagination and sorting

**Backend**:

- Multi-select: Uses `$in` operator with array of values
- Range filters: Uses `$gte` (greater than or equal) and `$lte` (less than or equal)
- Date range: Sets end date to 23:59:59.999 for inclusive end date
- All filters combined with AND logic

### Sorting Implementation

**Frontend**:

- Dropdown selection for sort field and order
- Supports: Date (newest first), Quantity, Customer Name (A-Z)
- Sort state maintained with filters and search

**Backend**:

- Maps sortBy values to database fields
- Converts sortOrder string to number (1 for asc, -1 for desc)
- Applies sort before pagination for correct results

### Pagination Implementation

**Frontend**:

- Fixed page size: 10 items per page
- Previous/Next navigation buttons
- Displays current page and total pages
- All filters, search, and sort preserved during navigation

**Backend**:

- Calculates skip value: `(page - 1) * limit`
- Uses MongoDB `skip()` and `limit()` methods
- Calculates total count for pagination metadata
- Returns pagination info: currentPage, totalPages, hasNextPage, hasPrevPage

## Communication Between Frontend and Backend

### Connection Setup

1. **Development**:

   - Vite proxy configuration in `vite.config.js` forwards `/api/*` requests to `http://localhost:5000`
   - No CORS issues in development

2. **Production**:

   - Environment variable `VITE_API_URL` can be set to backend URL
   - CORS configured on backend to accept requests from frontend origin

3. **CORS Configuration**:
   - Backend uses `cors` middleware
   - Allows all origins in development (configurable for production)

### Request/Response Format

**Request Format**:

- Query parameters for filters, search, sort, pagination
- Arrays sent as comma-separated strings
- Dates sent as YYYY-MM-DD format

**Response Format**:

- JSON with `sales` array and `pagination` object
- Error responses include error message

**Error Handling**:

- Try-catch blocks in hooks
- Error state displayed in UI
- Backend returns appropriate HTTP status codes

## Performance Optimizations

### Backend

- **MongoDB Indexes**: Indexes on frequently queried fields for fast lookups
- **Efficient Query Building**: Only active filters included in query
- **Pagination**: Limits data transfer (only 10 items per request)
- **Batch Insertion**: Seed data inserted in batches to avoid memory issues

### Frontend

- **Debounced Search**: Reduces API calls while user is typing
- **React Hooks**: Efficient re-renders with proper dependency arrays
- **Component Architecture**: Isolated components prevent unnecessary re-renders
- **CSS Styling**: Lightweight styling without heavy libraries

## Security Considerations

- **Input Validation**: Backend validates and sanitizes query parameters
- **Parameterized Queries**: Mongoose handles SQL injection prevention
- **CORS Configuration**: Backend configured to accept requests from specific origins
- **Environment Variables**: Sensitive configuration (MongoDB URI) stored in `.env` file
- **Error Messages**: Generic error messages to prevent information leakage

## Future Enhancements

- Authentication and authorization
- Export functionality (CSV, PDF)
- Advanced analytics and charts
- Real-time updates with WebSockets
- Caching layer (Redis) for frequently accessed data
- Unit and integration tests
- API rate limiting
- Request validation middleware
- Logging and monitoring
