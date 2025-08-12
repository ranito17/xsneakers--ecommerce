import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartProvider';
import { AuthProvider } from './context/AuthProvider';
import LoadingContainer from './components/loading/LoadingContainer';
import './app.module.css';

// Layout Components
const PagesLayout = lazy(() => import('./components/layout/PagesLayout'));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));

// Page Components
const Home = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const Cart = lazy(() => import('./pages/CartPage'));
const AuthForm = lazy(() => import('./pages/authPage'));
const ForgotPasswordForm = lazy(() => import('./components/auth/ForgotPasswordForm'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const ProductManagement = lazy(() => import('./pages/adminPages/ProductManagment'));
const OrderPage = lazy(() => import('./pages/OrderPage')); // Added OrderPage import
const OrderManagmentPage = lazy(() => import('./pages/adminPages/OrderManagmentPage'));
const SettingsPage = lazy(() => import('./pages/adminPages/SettingsPage'));
const DashboardPage = lazy(() => import('./pages/adminPages/DashboardPage'));
const ContactSupportPage = lazy(() => import('./pages/ContactSupportPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Suspense fallback={<LoadingContainer message="Loading application..." size="large" />}>
            <Routes>
                             {/* Layout Routes - Regular Pages */}
               <Route path="/" element={<PagesLayout />}>
                 <Route index element={<Home />} />
                 <Route path="products" element={<ProductsPage />} />
                 <Route path="cart" element={<Cart />} />
                 <Route path="orderPage" element={<OrderPage />} />
                 <Route path="contact" element={<ContactSupportPage />} />
               </Route>
              
              {/* Auth Routes - No Layout */}
              <Route path="/login" element={<AuthForm />} />
              <Route path="/signup" element={<AuthForm />} />
              <Route path="/forgot-password" element={<ForgotPasswordForm />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* Admin Routes - Admin Layout */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="orders" element={<OrderManagmentPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
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
