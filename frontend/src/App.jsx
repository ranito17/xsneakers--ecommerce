// ראני טובאסי ושאדי גדבאןת
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartProvider';
import { AuthProvider } from './context/AuthProvider';
import { SettingsProvider } from './context/SettingsProvider';
import { AdminStoreViewProvider } from './context/AdminStoreViewContext';
import { ToastProvider } from './components/common/toast';
import { LoadingContainer } from './components/contactForm';
import './app.module.css';

// Layout Components
const PagesLayout = lazy(() => import('./layout/PagesLayout'));
const AdminLayout = lazy(() => import('./layout/AdminLayout'));

// Page Components
const Home = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const Cart = lazy(() => import('./pages/CartPage'));
const AuthPage = lazy(() => import('./pages/authPage'));
const ProductManagement = lazy(() => import('./pages/adminPages/ProductManagment'));
const OrderPage = lazy(() => import('./pages/OrderPage'));
const OrderManagmentPage = lazy(() => import('./pages/adminPages/OrderManagmentPage'));
const SettingsPage = lazy(() => import('./pages/adminPages/SettingsPage'));
const DashboardPage = lazy(() => import('./pages/adminPages/DashboardPage'));
const ContactSupportPage = lazy(() => import('./pages/ContactSupportPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AnalyticsPage = lazy(() => import('./pages/adminPages/AnalyticsPage'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const ShippingPolicyPage = lazy(() => import('./pages/ShippingPolicyPage'));
const UserManagementPage = lazy(() => import('./pages/adminPages/UserManagmentPage'));
const MessagesPage = lazy(() => import('./pages/adminPages/MessagesPage'));
const CategoryManagementPage = lazy(() => import('./pages/adminPages/CategoryManagementPage'));
const ActivityPageAdmin = lazy(() => import('./pages/adminPages/ActivityPageAdmin'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <AdminStoreViewProvider>
            <ToastProvider>
              <CartProvider>
                <Suspense fallback={<LoadingContainer message="Loading application..." size="large" />}>
                <Routes>
                  {/* Layout Routes - Regular Pages */}
                  <Route path="/" element={<PagesLayout />}>
                    <Route index element={<Home />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="orderPage" element={<OrderPage />} />
                    <Route path="about" element={<AboutUsPage />} />
                    <Route path="contact" element={<ContactSupportPage />} />
                    <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="shipping-policy" element={<ShippingPolicyPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="wishlist" element={<WishlistPage />} />
                    <Route path="payment" element={<PaymentPage />} />
                  </Route>
                  
                  {/* Auth Routes - No Layout */}
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/signup" element={<AuthPage />} />
                  <Route path="/forgot-password" element={<AuthPage />} />
                  <Route path="/reset-password" element={<AuthPage />} />

                  {/* Admin Routes - Admin Layout */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="products" element={<ProductManagement />} />
                    <Route path="categories" element={<CategoryManagementPage />} />
                    <Route path="orders" element={<OrderManagmentPage />} />
                    <Route path="users" element={<UserManagementPage />} />
                    <Route path="messages" element={<MessagesPage />} />
                    <Route path="activity" element={<ActivityPageAdmin />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                  </Route>
                  
                  {/* Error Routes */}
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  {/* Catch-all route for 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
              </CartProvider>
            </ToastProvider>
          </AdminStoreViewProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
