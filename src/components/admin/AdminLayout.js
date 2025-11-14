// src/components/admin/AdminLayout.js
import React from 'react';
// Dùng NavLink để tự động thêm class 'active' cho link đang được chọn
import { NavLink, Outlet } from 'react-router-dom';
import './Admin.css';

const AdminLayout = () => {
    // Hàm này sẽ trả về class cho NavLink
    const getNavLinkClass = ({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link';

    return (
        <div className="admin-container">
            {/* Sidebar (Thanh bên) */}
            <aside className="admin-sidebar">
                <h2>Admin Dashboard</h2>
                <nav>
                    <NavLink to="/admin/products" className={getNavLinkClass}>Quản lý Sản phẩm</NavLink>
                    <NavLink to="/admin/categories" className={getNavLinkClass}>Quản lý Danh mục</NavLink>
                    <NavLink to="/admin/orders" className={getNavLinkClass}>Quản lý Đơn hàng</NavLink>
                    {/* Link quay về trang chủ */}
                    <NavLink to="/" className="sidebar-link back-link">← Quay về Trang chủ</NavLink>
                </nav>
            </aside>

            {/* Nội dung chính (Trang QL Sản phẩm, Đơn hàng... sẽ hiện ở đây) */}
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;