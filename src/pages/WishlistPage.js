// src/pages/WishlistPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard'; // Dùng lại ProductCard
import { Link } from 'react-router-dom';
// Import css dùng chung với HomePage hoặc tạo riêng
// import './WishlistPage.css';

function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWishlist = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('Vui lòng đăng nhập để xem danh sách yêu thích.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('http://localhost:8080/api/wishlist', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setWishlistItems(response.data || []);
                console.log('Wishlist:', response.data);
            } catch (err) {
                console.error('Lỗi khi lấy wishlist:', err);
                // ... (Xử lý lỗi tương tự các trang khác) ...
                setError('Không thể tải danh sách yêu thích.');
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, []); // Chỉ chạy 1 lần

    if (loading) return <p className="loading-message">Đang tải danh sách yêu thích...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="wishlist-page">
            <h1>Danh sách Yêu thích</h1>
            {wishlistItems.length === 0 ? (
                <p>Danh sách yêu thích của bạn đang trống. <Link to="/">Khám phá sản phẩm</Link></p>
            ) : (
                // Dùng lại grid layout giống HomePage
                <div className="product-list">
                    {wishlistItems.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default WishlistPage;