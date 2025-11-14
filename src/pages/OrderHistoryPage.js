// src/pages/OrderHistoryPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import './OrderHistoryPage.css'; // Tạo file CSS riêng

function OrderHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Hook để chuyển hướng

    // Hàm lấy danh sách địa chỉ (tách riêng)
    const fetchOrderHistory = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Vui lòng đăng nhập để xem lịch sử đơn hàng.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get('http://localhost:8080/api/orders/my-history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOrders(response.data || []);
            console.log('Order History:', response.data);
        } catch (err) {
            console.error('Lỗi khi lấy lịch sử đơn hàng:', err);
            if (err.response && err.response.status === 401) {
                setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            } else if (err.code === 'ERR_NETWORK') {
                setError('Không thể kết nối đến server.');
            }
            else {
                setError('Không thể tải lịch sử đơn hàng.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Gọi API khi component mount
    useEffect(() => {
        fetchOrderHistory();
    }, []); // Chỉ chạy 1 lần


    // --- [GEMINI_VN]: HÀM MỚI - Xử lý Hủy Đơn Hàng ---
    const handleCancelOrder = async (orderId) => {
        // 1. Xác nhận người dùng có muốn hủy không
        if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderId}?`)) {
            return;
        }

        setError(null); // Xóa lỗi cũ
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Vui lòng đăng nhập lại.');
            return;
        }

        try {
            // 2. Gọi API PUT /api/orders/{orderId}/cancel
            const response = await axios.put(
                `http://localhost:8080/api/orders/${orderId}/cancel`,
                {}, // Không cần gửi body
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            // 3. Xử lý thành công
            alert('Hủy đơn hàng thành công!');

            // 4. Cập nhật state (giao diện)
            // Cách 1: Tải lại toàn bộ danh sách (đơn giản nhất)
            // fetchOrderHistory();

            // Cách 2: Cập nhật state (hiệu quả hơn)
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? response.data : order // Thay thế đơn hàng đã hủy bằng data mới
                )
            );

        } catch (err) {
            // 5. Xử lý lỗi
            console.error(`Lỗi khi hủy đơn hàng ${orderId}:`, err);
            if (err.response) {
                if (err.response.status === 401) {
                    setError('Phiên đăng nhập hết hạn.');
                    navigate('/login'); // Chuyển về trang login
                } else if (err.response.status === 403) {
                    setError('Bạn không có quyền hủy đơn hàng này.');
                } else if (err.response.status === 400 || err.response.status === 404) {
                    setError('Không thể hủy đơn hàng này (có thể đã được xử lý hoặc không tìm thấy).');
                } else {
                    setError('Lỗi server. Không thể hủy đơn hàng.');
                }
            } else {
                setError('Lỗi kết nối. Vui lòng thử lại.');
            }
        }
        // Không cần setLoading vì việc hủy thường nhanh
    };


    // --- Render Giao diện ---
    if (loading) {
        return <p className="loading-message">Đang tải lịch sử đơn hàng...</p>;
    }

    return (
        <div className="order-history-page">
            <h1>Lịch sử Đơn hàng</h1>

            {/* Hiển thị lỗi chung (từ fetch hoặc cancel) */}
            {error && <p className="error-message" style={{ textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

            {orders.length === 0 ? (
                <p>Bạn chưa có đơn hàng nào. <Link to="/">Bắt đầu mua sắm</Link></p>
            ) : (
                <div className="order-list">
                    {orders.map(order => (
                        <div key={order.id} className="order-summary-card">
                            <div className="order-summary-header">
                                <span>Mã ĐH: #{order.id}</span>
                                <span>Ngày: {new Date(order.orderDate).toLocaleDateString('vi-VN')}</span>
                                {/* Thêm class CSS động cho trạng thái */}
                                <span>Trạng thái: <span className={`order-status status-${order.status?.toLowerCase()}`}>{order.status || 'N/A'}</span></span>
                                <span>Tổng: {order.totalAmount?.toLocaleString('vi-VN')} đ</span>
                            </div>
                            <div className="order-summary-details">
                                <h4>Chi tiết:</h4>
                                <ul>
                                    {order.orderDetails?.map(detail => (
                                        <li key={`${order.id}-${detail.productId}`}>
                                            <Link to={`/products/${detail.productId}`}>{detail.productName}</Link> (x{detail.quantity})
                                        </li>
                                    ))}
                                </ul>
                                <p><strong>Địa chỉ giao:</strong> {order.shippingAddress || 'N/A'}</p>
                            </div>


                            {/* Chỉ hiển thị nút Hủy khi trạng thái là PENDING */}
                            {order.status === 'PENDING' && (
                                <div className="order-card-actions">
                                    <button
                                        className="cancel-order-button"
                                        onClick={() => handleCancelOrder(order.id)}
                                    >
                                        Hủy đơn hàng
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default OrderHistoryPage;