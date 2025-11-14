// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import AddressPage from './pages/AddressPage';

import OrderHistoryPage from './pages/OrderHistoryPage';
import ProfileInfoPage from './pages/ProfileInfoPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';


import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';


import AdminOrdersPage from './pages/admin/AdminOrdersPage';




function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Routes>

          <Route path="/" element={<HomePage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cart" element={<CartPage />} />

          <Route path="/my-profile/orders" element={<OrderHistoryPage />} />
          <Route path="/my-profile/wishlist" element={<WishlistPage />} />
          <Route path="/my-profile/addresses" element={<AddressPage />} />
          <Route path="/my-profile/info" element={<ProfileInfoPage />} />

          {/* Route Admin */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />

              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<h1>404 Không tìm thấy trang</h1>} />

        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;