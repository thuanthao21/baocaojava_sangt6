// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

//  Component này sẽ kiểm tra xem user có phải là ADMIN không
const ProtectedRoute = () => {
    const { user, loading } = useAuth(); // Lấy thông tin user và trạng thái loading

    // 1. Nếu đang tải thông tin user (ví dụ: F5 trang admin)
    if (loading) {
        return <p className="loading-message">Đang kiểm tra quyền truy cập...</p>;
    }

    // 2. Nếu đã tải xong VÀ user có tồn tại VÀ role là ADMIN
    if (user && user.role === 'ADMIN') {
        // Cho phép truy cập
        return <Outlet />; // Render các component con (ví dụ: AdminProductsPage)
    }

    // 3. Nếu đã tải xong và không phải ADMIN (hoặc chưa đăng nhập)
    // Chuyển hướng về trang chủ
    console.warn("Truy cập bị từ chối: Yêu cầu quyền ADMIN.");
    return <Navigate to="/" replace />;
    // (Hoặc <Navigate to="/login" replace /> nếu muốn chuyển về trang login)
};

export default ProtectedRoute;