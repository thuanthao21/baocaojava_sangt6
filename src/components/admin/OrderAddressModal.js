import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Modal.css';

function OrderAddressModal({ isOpen, onClose, order, onSuccess }) {
    const { token } = useAuth();
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 1. Điền địa chỉ hiện tại vào form khi modal mở
    useEffect(() => {
        if (isOpen && order) {
            setAddress(order.shippingAddress || '');
            setError(null);
        }
    }, [isOpen, order]);

    // 2. Gửi request cập nhật
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const apiData = { shippingAddress: address };

        try {
            const response = await axios.put(
                `http://localhost:8080/api/admin/orders/${order.id}/address`,
                apiData,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert('Cập nhật địa chỉ thành công!');
            onSuccess(response.data); // Gửi data mới về
            onClose(); // Đóng modal
        } catch (err) {
            console.error('Lỗi cập nhật địa chỉ:', err.response || err);
            setError(err.response?.data?.message || 'Lỗi không xác định.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !order) return null;

    // Chỉ cho phép sửa nếu trạng thái là PENDING
    const canEdit = order.status === 'PENDING';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Cập nhật Địa chỉ Đơn hàng #{order.id}</h3>
                {error && <p className="error-message">{error}</p>}

                {!canEdit && (
                    <p className="error-message">
                        Không thể sửa địa chỉ. Đơn hàng này đã ở trạng thái {order.status}.
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="shippingAddress">Địa chỉ giao hàng mới:</label>
                        <textarea
                            id="shippingAddress"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            rows="4"
                            required
                            disabled={!canEdit || loading} // Tắt nếu không PENDING
                            style={{ width: '100%', resize: 'vertical' }}
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn-primary" disabled={!canEdit || loading}>
                            {loading ? 'Đang lưu...' : 'Lưu Địa chỉ'}
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

export default OrderAddressModal;