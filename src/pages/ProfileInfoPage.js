// src/pages/ProfileInfoPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AuthForm.css'; // Tái sử dụng CSS của form Đăng nhập/Đăng ký

function ProfileInfoPage() {
    // State cho form Cập nhật thông tin
    const [profileData, setProfileData] = useState({ fullName: '', email: '' });
    const [profileLoading, setProfileLoading] = useState(true); // Loading ban đầu
    const [profileError, setProfileError] = useState(null);
    const [profileSuccess, setProfileSuccess] = useState(null);

    // State cho form Đổi mật khẩu
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmationPassword: '' });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState(null);
    const [passwordSuccess, setPasswordSuccess] = useState(null);

    // Lấy token
    const token = localStorage.getItem('authToken');

    // Hàm helper để tạo config header
    const getAuthConfig = () => ({
        headers: { 'Authorization': `Bearer ${token}` }
    });

    // Load thông tin user hiện tại khi trang tải
    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) {
                setProfileError("Vui lòng đăng nhập.");
                setProfileLoading(false);
                return;
            }
            try {
                const response = await axios.get('http://localhost:8080/api/profile', getAuthConfig());
                setProfileData({
                    fullName: response.data.fullName || '',
                    email: response.data.email || ''
                });
            } catch (err) {
                console.error("Lỗi khi tải profile:", err);
                setProfileError("Không thể tải thông tin tài khoản.");
            } finally {
                setProfileLoading(false);
            }
        };
        fetchProfile();
    }, [token]); // Chạy lại nếu token thay đổi

    // Xử lý Cập nhật thông tin
    const handleProfileSubmit = async (event) => {
        event.preventDefault();
        setProfileLoading(true); // Dùng loading chung
        setProfileError(null);
        setProfileSuccess(null);

        try {
            const response = await axios.put('http://localhost:8080/api/profile', profileData, getAuthConfig());
            setProfileData({
                fullName: response.data.fullName,
                email: response.data.email
            });
            setProfileSuccess('Cập nhật thông tin thành công!');
        } catch (err) {
            console.error("Lỗi khi cập nhật profile:", err);
            // err.response.data chính là message lỗi từ backend (ví dụ: "Email already in use...")
            setProfileError(err.response?.data || 'Cập nhật thất bại. Vui lòng thử lại.');
        } finally {
            setProfileLoading(false);
        }
    };

    // Xử lý Đổi mật khẩu
    const handleChangePasswordSubmit = async (event) => {
        event.preventDefault();
        setPasswordLoading(true);
        setPasswordError(null);
        setPasswordSuccess(null);

        if (passwordData.newPassword !== passwordData.confirmationPassword) {
            setPasswordError("Mật khẩu mới và mật khẩu xác nhận không khớp.");
            setPasswordLoading(false);
            return;
        }

        try {
            const response = await axios.put('http://localhost:8080/api/profile/change-password', passwordData, getAuthConfig());
            setPasswordSuccess(response.data || 'Đổi mật khẩu thành công!');
            // Reset form mật khẩu
            setPasswordData({ currentPassword: '', newPassword: '', confirmationPassword: '' });
        } catch (err) {
            console.error("Lỗi khi đổi mật khẩu:", err);
            // err.response.data chính là message lỗi từ backend
            setPasswordError(err.response?.data || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
        } finally {
            setPasswordLoading(false);
        }
    };

    // Hàm xử lý thay đổi cho 2 form
    const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

    if (profileLoading && !profileData.email) {
        return <p className="loading-message">Đang tải thông tin tài khoản...</p>;
    }

    return (
        <div className="profile-page-container">
            {/* Form 1: Cập nhật thông tin */}
            <div className="auth-form-container">
                <h2>Thông tin Tài khoản</h2>
                <form onSubmit={handleProfileSubmit} className="auth-form">
                    {/* Hiển thị thông báo */}
                    {profileError && <p className="error-message">{profileError}</p>}
                    {profileSuccess && <p className="success-message">{profileSuccess}</p>}

                    <div className="form-group">
                        <label htmlFor="fullName">Họ và tên:</label>
                        <input type="text" id="fullName" name="fullName" value={profileData.fullName} onChange={handleProfileChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" value={profileData.email} onChange={handleProfileChange} required />
                    </div>
                    <button type="submit" disabled={profileLoading}>
                        {profileLoading ? 'Đang lưu...' : 'Cập nhật thông tin'}
                    </button>
                </form>
            </div>

            {/* Form 2: Đổi mật khẩu */}
            <div className="auth-form-container" style={{ marginTop: '2rem' }}>
                <h2>Đổi Mật khẩu</h2>
                <form onSubmit={handleChangePasswordSubmit} className="auth-form">
                    {/* Hiển thị thông báo */}
                    {passwordError && <p className="error-message">{passwordError}</p>}
                    {passwordSuccess && <p className="success-message">{passwordSuccess}</p>}

                    <div className="form-group">
                        <label htmlFor="currentPassword">Mật khẩu hiện tại:</label>
                        <input type="password" id="currentPassword" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">Mật khẩu mới (ít nhất 6 ký tự):</label>
                        <input type="password" id="newPassword" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required minLength={6} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmationPassword">Xác nhận mật khẩu mới:</label>
                        <input type="password" id="confirmationPassword" name="confirmationPassword" value={passwordData.confirmationPassword} onChange={handlePasswordChange} required />
                    </div>
                    <button type="submit" disabled={passwordLoading}>
                        {passwordLoading ? 'Đang lưu...' : 'Đổi mật khẩu'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ProfileInfoPage;