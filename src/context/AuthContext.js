// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// 1. Tạo Context
const AuthContext = createContext();

// 2. Tạo Provider (Component "bọc" toàn bộ App)
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [user, setUser] = useState(null); // Sẽ lưu thông tin user (id, username, role)
    const [loading, setLoading] = useState(true); // State loading ban đầu

    // Hàm gọi API /api/profile để lấy thông tin user từ token
    const fetchUserProfile = async (authToken) => {
        if (!authToken) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get('http://localhost:8080/api/profile', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            setUser(response.data); // Lưu thông tin user (bao gồm cả role)
            console.log("User profile fetched:", response.data);
        } catch (error) {
            console.error("Lỗi khi lấy profile:", error);
            // Nếu token hỏng/hết hạn, xóa nó đi
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // useEffect này chạy 1 lần khi App khởi động
    useEffect(() => {
        fetchUserProfile(token);
    }, [token]); // Chạy lại nếu token thay đổi

    // Hàm Login
    const login = async (username, password) => {
        // Gọi API /api/auth/login
        const response = await axios.post('http://localhost:8080/api/auth/login', { username, password });
        const newToken = response.data.token;

        // Lưu token
        localStorage.setItem('authToken', newToken);
        setToken(newToken);

        // Lấy thông tin user ngay sau khi login
        await fetchUserProfile(newToken);
    };

    // Hàm Logout
    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        // Xóa cache wishlist (nếu bạn có)
        // clearWishlistCache();
    };

    // 3. Giá trị cung cấp cho các component con
    const value = {
        token,
        user,
        isLoggedIn: !!user, // User được coi là đăng nhập nếu có thông tin user
        loading, // Trạng thái loading
        login,
        logout
    };

    // return provider, chỉ render children khi đã hết loading
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// 4. Tạo Custom Hook để sử dụng Context
export const useAuth = () => {
    return useContext(AuthContext);
};