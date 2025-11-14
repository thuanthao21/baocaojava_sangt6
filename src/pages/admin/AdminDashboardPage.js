// src/pages/admin/AdminDashboardPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css'; // File CSS riêng cho Dashboard

function AdminDashboardPage() {
    const { user } = useAuth(); // Lấy thông tin user để chào mừng

    return (
        <div className="admin-dashboard">
            <h1 className="dashboard-title">Chào mừng, {user?.fullName || user?.username}!</h1>
            <p className="dashboard-subtitle">Chọn một chức năng để bắt đầu quản lý:</p>

            <div className="dashboard-grid">
                {/* Thẻ Quản lý Sản phẩm */}
                <Link to="/admin/products" className="dashboard-card">
                    <span className="card-icon">🛍️</span>
                    <h3 className="card-title">Quản lý Sản phẩm</h3>
                    <p className="card-description">Thêm, sửa, xóa và cập nhật số lượng sản phẩm.</p>
                </Link>

                {/* Thẻ Quản lý Đơn hàng */}
                <Link to="/admin/orders" className="dashboard-card">
                    <span className="card-icon">📦</span>
                    <h3 className="card-title">Quản lý Đơn hàng</h3>
                    <p className="card-description">Xem và cập nhật trạng thái các đơn hàng.</p>
                </Link>

                {/* Thẻ Quản lý Danh mục */}
                <Link to="/admin/categories" className="dashboard-card">
                    <span className="card-icon">🏷️</span>
                    <h3 className="card-title">Quản lý Danh mục</h3>
                    <p className="card-description">Tạo và chỉnh sửa các danh mục sản phẩm.</p>
                </Link>

                {/* Bạn có thể thêm các thẻ khác ở đây nếu cần */}
            </div>
        </div>
    );
}

export default AdminDashboardPage;