// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; // Đảm bảo bạn đã tạo file CSS này
import { clearWishlistCache } from '../utils/wishlistUtils'; // Đảm bảo đường dẫn này đúng
import { useAuth } from '../context/AuthContext'; // <-- [GEMINI_VN]: Import useAuth

function Header() {
    // [GEMINI_VN]: Lấy trạng thái đăng nhập, thông tin user, và hàm logout từ Context
    const { isLoggedIn, user, logout } = useAuth();

    // Hàm xử lý đăng xuất
    const handleLogout = () => {
        logout(); // Gọi hàm logout từ Context (xóa token, user)
        clearWishlistCache(); // Xóa cache wishlist
        window.location.href = '/'; // Chuyển về trang chủ (cách này đảm bảo reset mọi state)
    };

    return (
        <header className="app-header">
            <nav className="header-nav">
                {/* Link Logo/Trang chủ */}
                <Link to="/" className="brand-link">Spring Jewels</Link>
                {/* Các link điều hướng */}
                <div className="nav-links">
                    <Link to="/" className="nav-link">Trang chủ</Link>
                    <Link to="/cart" className="nav-link">Giỏ hàng</Link>

                    {/*  Điều kiện hiển thị dựa trên isLoggedIn từ Context */}
                    {isLoggedIn ? (
                        <>
                            {/*  Hiển thị link Admin nếu user.role là ADMIN */}
                            {user && user.role === 'ADMIN' && (
                                <Link to="/admin" className="nav-link admin-link">Quản lý (Admin)</Link>
                            )}

                            {/* Các link profile */}
                            <Link to="/my-profile/info" className="nav-link">Tài khoản</Link>
                            <Link to="/my-profile/orders" className="nav-link">Đơn hàng</Link>
                            <Link to="/my-profile/wishlist" className="nav-link">Yêu thích ❤️</Link>
                            <Link to="/my-profile/addresses" className="nav-link">Địa chỉ</Link>

                            {/* Nút đăng xuất */}
                            <button onClick={handleLogout} className="nav-link logout-button">Đăng xuất</button>
                        </>
                    ) : (
                        <>
                            {/* Link đăng nhập/đăng ký */}
                            <Link to="/login" className="nav-link">Đăng nhập</Link>
                            <Link to="/register" className="nav-link">Đăng ký</Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}
export default Header;