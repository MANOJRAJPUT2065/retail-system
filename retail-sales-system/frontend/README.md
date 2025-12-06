# Retail Sales System - Frontend

This is the frontend for the Retail Sales System, built with React, Redux, and Material-UI. It provides a responsive and user-friendly interface for managing products, customers, and sales.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [API Integration](#api-integration)
- [State Management](#state-management)
- [Styling](#styling)
- [Testing](#testing)
- [Deployment](#deployment)

## Features

- **Responsive Design**: Works on desktop and mobile devices
- **Product Management**: View, add, edit, and delete products
- **Customer Management**: Manage customer information
- **Sales Processing**: Process and track sales transactions
- **Authentication**: Secure login and user management
- **Data Visualization**: Charts and statistics for sales and inventory
- **Search & Filtering**: Advanced search and filtering capabilities
- **Pagination**: Efficient data loading with pagination
- **Form Validation**: Client-side and server-side validation

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API server (see backend README for setup)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd retail-sales-system/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the frontend root directory and add the following:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_NAME="Retail Sales System"
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```
   The application will be available at `http://localhost:3000` by default.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Base URL for the backend API | `http://localhost:5000/api` |
| `REACT_APP_NAME` | Application name | `Retail Sales System` |
| `REACT_APP_ENABLE_ANALYTICS` | Enable analytics (true/false) | `false` |

## Project Structure

```
frontend/
├── public/                 # Static files
├── src/
│   ├── assets/             # Images, fonts, and other static assets
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Common components (buttons, inputs, etc.)
│   │   ├── layout/         # Layout components (header, sidebar, etc.)
│   │   └── ui/             # UI components (modals, dialogs, etc.)
│   ├── constants/          # Application constants
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   │   ├── Products/       # Products page and related components
│   │   ├── Customers/      # Customers page and related components
│   │   ├── Sales/          # Sales page and related components
│   │   └── Dashboard/      # Dashboard page and related components
│   ├── services/           # API services
│   │   ├── api.js          # Axios instance and API configuration
│   │   └── auth.js         # Authentication service
│   ├── store/              # Redux store configuration
│   │   ├── slices/         # Redux slices
│   │   └── store.js        # Store configuration
│   ├── styles/             # Global styles and theme
│   ├── utils/              # Utility functions
│   ├── App.js              # Main App component
│   └── index.js            # Application entry point
├── .env                   # Environment variables
├── package.json           # Project dependencies and scripts
└── README.md             # This file
```

## Available Scripts

In the project directory, you can run:

### `npm start` or `yarn start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test` or `yarn test`

Launches the test runner in interactive watch mode.

### `npm run build` or `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## API Integration

The frontend communicates with the backend API using Axios. The API service is configured in `src/services/api.js`.

### Making API Requests

```javascript
import api from './services/api';

// GET request
const fetchProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// POST request
const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};
```

### Authentication

The application uses JWT for authentication. The authentication service is in `src/services/auth.js`.

```javascript
import api from './api';

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  // Store the token in localStorage
  localStorage.setItem('token', response.data.token);
  return response.data.user;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  // Decode the token to get user info
  const decoded = jwtDecode(token);
  return decoded.user;
};
```

## State Management

The application uses Redux for state management with Redux Toolkit.

### Redux Slices

Example product slice (`src/store/slices/productSlice.js`):

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../services/productService';

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to fetch products';
      });
  },
});

export default productSlice.reducer;
```

## Styling

The application uses Material-UI for styling with a custom theme. The theme configuration is in `src/styles/theme.js`.

### Custom Styling

For custom components, you can use the `sx` prop or the `styled` utility from `@mui/material/styles`.

```jsx
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

const CustomButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
}));

// Usage
<CustomButton variant="contained" color="primary">
  Click me
</CustomButton>
```

## Testing

### Running Tests

```bash
npm test
# or
yarn test
```

### Writing Tests

Example test for a React component:

```jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductList from '../ProductList';

describe('ProductList', () => {
  it('renders a list of products', () => {
    const products = [
      { id: 1, name: 'Product 1', price: 10 },
      { id: 2, name: 'Product 2', price: 20 },
    ];
    
    render(<ProductList products={products} />);
    
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });
});
```

## Deployment

### Building for Production

```bash
npm run build
# or
yarn build
```

This will create a `build` directory with the production build of your app.

### Serving the Production Build

You can use `serve` to serve the production build locally:

```bash
npm install -g serve
serve -s build
```

### Deploying to a Static Hosting Service

You can deploy the `build` folder to any static hosting service, such as:
- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [GitHub Pages](https://pages.github.com/)

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
