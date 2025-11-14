// src/pages/admin/AdminOrdersPage.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import OrderUpdateModal from '../../components/admin/OrderUpdateModal';
import OrderAddressModal from '../../components/admin/OrderAddressModal'; // <-- 1. Import Modal mới
import '../../components/admin/Admin.css';

function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // [CẬP NHẬT] Tách state cho 2 modal
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const { token } = useAuth();

    const getAuthConfig = useCallback(() => ({
        headers: { 'Authorization': `Bearer ${token}` }
    }), [token]);

    // Hàm tải danh sách đơn hàng từ API Admin
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:8080/api/admin/orders', getAuthConfig());
            setOrders(response.data);
        } catch (err) {
            console.error("Lỗi khi tải đơn hàng:", err.response || err);
            setError("Không thể tải danh sách đơn hàng. Vui lòng kiểm tra kết nối API.");
        } finally {
            setLoading(false);
        }
    }, [getAuthConfig]);

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token, fetchOrders]);

    // Hàm mở modal để cập nhật TRẠNG THÁI
    const handleUpdateStatus = (order) => {
        setSelectedOrder(order);
        setIsStatusModalOpen(true); // Mở modal trạng thái
    };

    // [MỚI] Hàm mở modal để cập nhật ĐỊA CHỈ
    const handleUpdateAddress = (order) => {
        setSelectedOrder(order);
        setIsAddressModalOpen(true); // Mở modal địa chỉ
    };

    // [MỚI] Hàm callback khi cập nhật (status hoặc address) thành công
    // Giúp cập nhật 1 hàng thay vì gọi lại toàn bộ API
    const handleUpdateSuccess = (updatedOrder) => {
        setOrders(prevOrders =>
            prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o)
        );
        // Đóng cả 2 modal
        setIsStatusModalOpen(false);
        setIsAddressModalOpen(false);
    };

    // Hàm định dạng tiền tệ
    const formatCurrency = (amount) => {
        const num = amount ? parseFloat(amount) : 0;
        return num.toLocaleString('vi-VN') + ' đ';
    };

    // Hàm định dạng ngày
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    if (loading) return <p className="loading-message">Đang tải danh sách đơn hàng...</p>;

    return (
        <div className="admin-page">
            {error && <p className="error-message">{error}</p>}

            <div className="admin-header">
                <h2>Quản lý Đơn hàng</h2>
            </div>

            {/* Modal Cập nhật Trạng thái */}
            <OrderUpdateModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                order={selectedOrder}
                onSuccess={handleUpdateSuccess} // Cập nhật state (tối ưu)
            />

            {/* [MỚI] Modal Cập nhật Địa chỉ */}
            <OrderAddressModal
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                order={selectedOrder}
                onSuccess={handleUpdateSuccess} // Cập nhật state (tối ưu)
            />

            <table className="admin-table order-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Người dùng</th>
                        <th>Ngày đặt</th>
                        <th>Tổng tiền</th>
                        <th>Địa chỉ</th> {/* <-- THÊM CỘT ĐỊA CHỈ */}
                        <th>Trạng thái</th>
                        <th>Chi tiết SP</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.username || 'Khách (ID: ' + order.userId + ')'}</td>
                            <td>{formatDate(order.orderDate)}</td>
                            <td>{formatCurrency(order.totalAmount)}</td>

                            {/* [MỚI] Hiển thị địa chỉ */}
                            <td style={{ maxWidth: '200px', whiteSpace: 'normal', fontSize: '0.9em' }}>
                                {order.shippingAddress}
                            </td>

                            <td><span className={`status-${order.status.toLowerCase()}`}>{order.status}</span></td>
                            <td>
                                <ul>
                                    {order.orderDetails.map(detail => (
                                        <li key={detail.productId}>
                                            {detail.productName} (x{detail.quantity})
                                        </li>
                                    ))}
                                </ul>
                            </td>
                            <td>
                                <button onClick={() => handleUpdateStatus(order)} className="btn-secondary btn-sm">
                                    Cập nhật TT
                                </button>

                                {/* [MỚI] Nút Sửa Địa chỉ */}
                                <button
                                    onClick={() => handleUpdateAddress(order)}
                                    className="btn-secondary btn-sm" // (Hoặc btn-info nếu bạn có)
                                    disabled={order.status !== 'PENDING'} // Chỉ cho phép khi PENDING
                                    style={{ marginTop: '5px' }} // Thêm khoảng cách
                                >
                                    Sửa ĐC
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminOrdersPage;