# Retail Sales System - Backend API

This is the backend API for the Retail Sales System, built with Node.js, Express, and MongoDB. It provides RESTful endpoints for managing products, customers, and sales data.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Validation](#validation)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Reference](#api-reference)

## Features

- **Product Management**: CRUD operations for products with filtering, sorting, and pagination
- **Customer Management**: Manage customer information and purchase history
- **Sales Processing**: Record and track sales transactions
- **Search & Filtering**: Advanced search capabilities across products and customers
- **Data Analytics**: Get insights with sales statistics and product analytics
- **Authentication & Authorization**: Secure endpoints with JWT authentication
- **Input Validation**: Request validation middleware
- **Error Handling**: Consistent error responses
- **API Documentation**: Comprehensive API documentation

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (v4.4 or higher)
- Git

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd retail-sales-system/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add the required environment variables (see [Environment Variables](#environment-variables)).

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The API will be available at `http://localhost:5000` by default.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/retail_sales
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

## API Documentation

### Base URL
All API endpoints are prefixed with `/api`.

### Response Format
All API responses follow the same JSON format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

### Error Responses

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Something went wrong |

## API Reference

### Products

#### Get All Products
```
GET /api/products
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sortBy` - Sort field and order (format: `field:order`, e.g., `name:asc` or `price:desc`)
- `category` - Filter by category
- `brand` - Filter by brand
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `inStock` - Filter by stock availability (true/false)

#### Get Product by ID
```
GET /api/products/:id
```

#### Search Products
```
GET /api/products/search?q=search_term
```

#### Get Product Categories
```
GET /api/products/categories
```

#### Get Product Brands
```
GET /api/products/brands
```

#### Get Product Statistics
```
GET /api/products/stats
```

#### Create Product (Admin)
```
POST /api/products
```

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "category": "Electronics",
  "brand": "Brand Name",
  "stockQuantity": 100,
  "imageUrl": "https://example.com/image.jpg"
}
```

#### Update Product (Admin)
```
PUT /api/products/:id
```

#### Delete Product (Admin)
```
DELETE /api/products/:id
```

### Customers
[Similar documentation for customer endpoints]

### Sales
[Similar documentation for sales endpoints]

## Authentication

### Login
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Register
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "role": "user"
}
```

## Error Handling

The API uses a consistent error handling middleware that returns errors in the following format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detailed error message 1", "Detailed error message 2"]
}
```

## Validation

All input is validated using express-validator. The API will return validation errors if the input doesn't meet the requirements.

## Testing

To run tests:

```bash
npm test
# or
yarn test
```

## Deployment

### Production

1. Set `NODE_ENV=production` in your environment variables
2. Make sure to use a production-ready MongoDB URI
3. Use PM2 or similar process manager for Node.js applications

```bash
# Install PM2 globally
npm install -g pm2

# Start the application in production mode
NODE_ENV=production pm2 start src/index.js --name "retail-sales-api"

# Save the PM2 process list
pm2 save

# Generate startup script (for auto-start on server reboot)
pm2 startup
```

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
