# Services Documentation

This folder contains all API service functions for the frontend application.

## File Structure

```
frontend/src/services/
├── api.js              # Main axios configuration and interceptors
├── authApi.js          # Authentication-related API calls
├── productApi.js       # Product and category-related API calls
├── index.js           # Central export file for all services
└── README.md          # This documentation file
```

## Usage

### 1. Import Services

```javascript
// Import specific services
import { authApi, productApi } from '../services';

// Or import the base api instance
import { api } from '../services';
```

### 2. Authentication API

```javascript
import { authApi } from '../services';

// Check if user is authenticated
const checkAuth = async () => {
    try {
        const response = await authApi.checkAuth();
        if (response.success) {
            console.log('User is authenticated:', response.user);
        }
    } catch (error) {
        console.error('Auth check failed:', error);
    }
};

// Login user
const login = async (email, password) => {
    try {
        const response = await authApi.login(email, password);
        if (response.success) {
            console.log('Login successful:', response.user);
        }
    } catch (error) {
        console.error('Login failed:', error);
    }
};

// Signup user
const signup = async (userData) => {
    try {
        const response = await authApi.signup(userData);
        if (response.success) {
            console.log('Signup successful:', response.user);
        }
    } catch (error) {
        console.error('Signup failed:', error);
    }
};

// Logout user
const logout = async () => {
    try {
        await authApi.logout();
        console.log('Logout successful');
    } catch (error) {
        console.error('Logout failed:', error);
    }
};
```

### 3. Product API

```javascript
import { productApi } from '../services';

// Get all products
const getProducts = async () => {
    try {
        const response = await productApi.getProducts();
        if (response.success) {
            console.log('Products:', response.data);
        }
    } catch (error) {
        console.error('Failed to fetch products:', error);
    }
};

// Get product by ID
const getProduct = async (productId) => {
    try {
        const response = await productApi.getProductById(productId);
        if (response.success) {
            console.log('Product:', response.data);
        }
    } catch (error) {
        console.error('Failed to fetch product:', error);
    }
};

// Create new product
const createProduct = async (productData) => {
    try {
        const response = await productApi.createProduct(productData);
        if (response.success) {
            console.log('Product created:', response.data);
        }
    } catch (error) {
        console.error('Failed to create product:', error);
    }
};

// Delete product
const deleteProduct = async (productId) => {
    try {
        const response = await productApi.deleteProduct(productId);
        if (response.success) {
            console.log('Product deleted successfully');
        }
    } catch (error) {
        console.error('Failed to delete product:', error);
    }
};

// Get all categories
const getCategories = async () => {
    try {
        const response = await productApi.getCategories();
        if (response.success) {
            console.log('Categories:', response.data);
        }
    } catch (error) {
        console.error('Failed to fetch categories:', error);
    }
};
```

## Benefits

1. **Proper Organization**: Services are separated from utility functions
2. **Centralized Configuration**: All API calls use the same base configuration
3. **Automatic Logging**: Request and response logging is handled automatically
4. **Error Handling**: Consistent error handling across all API calls
5. **Maintainability**: Easy to update API endpoints or add new features
6. **Reusability**: API functions can be reused across components

## Migration Guide

To migrate existing components:

1. Replace `import axios from 'axios'` with `import { authApi, productApi } from '../services'`
2. Replace direct axios calls with service function calls
3. Remove hardcoded URLs and credentials (handled automatically)
4. Update response handling (remove `.data` wrapper)

### Before:
```javascript
const response = await axios.get('http://localhost:3001/productRoutes/', {
    withCredentials: true
});
const products = response.data.data;
```

### After:
```javascript
const response = await productApi.getProducts();
const products = response.data;
``` 