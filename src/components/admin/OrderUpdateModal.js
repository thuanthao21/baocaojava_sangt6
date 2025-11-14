import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Modal.css';

// Các trạng thái đơn hàng có thể có
const STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'SHIPPED', label: 'Đang giao hàng' },
    { value: 'DELIVERED', label: 'Đã giao hàng' },
    { value: 'CANCELLED', label: 'Đã hủy' },
];

function OrderUpdateModal({ isOpen, onClose, order, onSuccess }) {
    const { token } = useAuth();
    const [newStatus, setNewStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Điền trạng thái hiện tại khi modal mở
    useEffect(() => {
        if (isOpen && order) {
            setNewStatus(order.status);
            setError(null);
        }
    }, [isOpen, order]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!order || !newStatus) return;

        setLoading(true);
        setError(null);

        const apiData = { status: newStatus };

        try {
            // Gọi API Admin: PUT /api/admin/orders/{id}/status
            await axios.put(
                `http://localhost:8080/api/admin/orders/${order.id}/status`,
                apiData,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            alert(`Cập nhật đơn hàng #${order.id} thành trạng thái ${newStatus} thành công!`);
            onSuccess(); // Tải lại bảng
            onClose();   // Đóng modal

        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái:', err.response || err);
            const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !order) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Cập nhật Trạng thái Đơn hàng #{order.id}</h3>
                <p>Tổng tiền: **{order.totalAmount.toLocaleString('vi-VN')} đ**</p>

                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="status">Trạng thái hiện tại:</label>
                        <select
                            id="status"
                            name="status"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            required
                        >
                            {STATUS_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Đang lưu...' : 'Lưu Trạng thái'}
                        </button>
                        <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default OrderUpdateModal;