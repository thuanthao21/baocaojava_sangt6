// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import thêm Link
// import axios from 'axios'; // Không cần axios trực tiếp ở đây nữa
import './AuthForm.css'; // File CSS chung cho form
import { useAuth } from '../context/AuthContext'; // <-- [GEMINI_VN]: Import useAuth

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // [GEMINI_VN]: Lấy hàm login từ AuthContext
    const { login } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // [GEMINI_VN]: Gọi hàm login từ Context
            await login(username, password);

            // Context sẽ tự động cập nhật trạng thái isLoggedIn và user
            // Header sẽ tự động re-render

            // Chuyển hướng về trang chủ
            navigate('/');
            // window.location.reload(); // Không cần reload nữa!

        } catch (err) {
            console.error('Lỗi khi đăng nhập:', err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                setError('Tên đăng nhập hoặc mật khẩu không đúng.');
            } else if (err.code === 'ERR_NETWORK') {
                setError('Không thể kết nối đến server.');
            }
            else {
                setError('Đã xảy ra lỗi. Vui lòng thử lại.');
            }
            setLoading(false);
        }
        // Không cần setLoading(false) ở cuối vì nếu thành công, component sẽ unmount
    };

    return (
        <div className="auth-form-container">
            <h2>Đăng Nhập</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="username">Tên đăng nhập:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Mật khẩu:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
                </button>
            </form>
            {/* Sửa <a href> thành <Link to> để điều hướng trong React */}
            <p className="switch-auth-link">
                Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>
        </div>
    );
}

export default LoginPage;