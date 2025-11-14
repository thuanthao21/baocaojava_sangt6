// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuthForm.css'; // Dùng chung file CSS

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState(''); // Thêm state cho fullName
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Gọi API Register backend
            const response = await axios.post('http://localhost:8080/api/auth/register', {
                username: username,
                password: password,
                email: email,
                fullName: fullName, // Gửi fullName
            });

            // Lưu token vào localStorage sau khi đăng ký thành công
            localStorage.setItem('authToken', response.data.token);
            console.log('Registration successful, token saved:', response.data.token);

            // Chuyển hướng về trang chủ
            navigate('/');
            window.location.reload();

        } catch (err) {
            console.error('Lỗi khi đăng ký:', err);
            if (err.response && err.response.status === 400) {
                 // Lỗi validation từ backend (ví dụ: email sai, password ngắn)
                 // Biến đổi object lỗi thành chuỗi dễ đọc hơn
                const errorData = err.response.data;
                const errorMessages = Object.entries(errorData)
                    .map(([field, message]) => `${field}: ${message}`)
                    .join('\n');
                setError(errorMessages || 'Dữ liệu không hợp lệ.');
            } else if (err.response && err.response.status === 409) {
                // Lỗi trùng lặp (username/email đã tồn tại)
                setError(err.response.data?.message || 'Tên đăng nhập hoặc email đã tồn tại.');
            }
             else {
                setError('Đã xảy ra lỗi. Vui lòng thử lại.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="auth-form-container">
            <h2>Đăng Ký Tài Khoản</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="username">Tên đăng nhập:</label>
                    <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Mật khẩu (ít nhất 6 ký tự):</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="fullName">Họ và tên:</label>
                    <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                {/* Hiển thị lỗi dưới dạng pre để xuống dòng */}
                {error && <pre className="error-message">{error}</pre>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Đăng Ký'}
                </button>
            </form>
            <p className="switch-auth-link">
                Đã có tài khoản? <a href="/login">Đăng nhập</a>
            </p>
        </div>
    );
}

export default RegisterPage;