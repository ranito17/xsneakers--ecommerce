import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartProvider';
import { AuthProvider } from './context/AuthProvider';
import './app.module.css';

// Layout Components
const PagesLayout = lazy(() => import('./components/layout/PagesLayout'));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));

// Page Components
const Home = lazy(() => import('./pages/Home'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const Cart = lazy(() => import('./pages/CartPage'));
const AuthForm = lazy(() => import('./pages/authPage'));
const ForgotPasswordForm = lazy(() => import('./components/auth/ForgotPasswordForm'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const ProductManagement = lazy(() => import('./pages/adminPages/ProductManagment'));
const OrderPage = lazy(() => import('./pages/OrderPage')); // Added OrderPage import
const OrderManagmentPage = lazy(() => import('./pages/adminPages/OrderManagmentPage'));
const SettingsPage = lazy(() => import('./pages/adminPages/SettingsPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              {/* Layout Routes - Regular Pages */}
              <Route path="/" element={<PagesLayout />}>
                <Route index element={<Home />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="cart" element={<Cart />} />
                <Route path="orderPage" element={<OrderPage />} />
              </Route>
              
              {/* Auth Routes - No Layout */}
              <Route path="/login" element={<AuthForm />} />
              <Route path="/signup" element={<AuthForm />} />
              <Route path="/forgot-password" element={<ForgotPasswordForm />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* Admin Routes - Admin Layout */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="products" element={<ProductManagement />} />
                <Route path="orders" element={<OrderManagmentPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              
              {/* Error Routes */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
            </Routes>
          </Suspense>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
