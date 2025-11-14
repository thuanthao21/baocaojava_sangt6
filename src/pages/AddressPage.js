// src/pages/AddressPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddressPage.css'; // Tạo file CSS riêng

function AddressPage() {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho form thêm/sửa địa chỉ
    const [isEditing, setIsEditing] = useState(false); // Đang sửa hay đang thêm mới?
    const [currentAddress, setCurrentAddress] = useState(null); // Địa chỉ đang sửa
    const [formData, setFormData] = useState({ street: '', city: '', phoneNumber: '', isDefault: false }); // Dữ liệu form
    const [formError, setFormError] = useState(null); // Lỗi của form

    // Hàm lấy danh sách địa chỉ
    const fetchAddresses = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Vui lòng đăng nhập.');
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get('http://localhost:8080/api/addresses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAddresses(response.data || []);
        } catch (err) {
            console.error('Lỗi khi lấy địa chỉ:', err);
            setError('Không thể tải danh sách địa chỉ.');
        } finally {
            setLoading(false);
        }
    };

    // Gọi fetchAddresses khi component mount
    useEffect(() => {
        fetchAddresses();
    }, []);

    // Xử lý thay đổi input trong form
    const handleFormChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Xử lý khi nhấn nút Lưu (Thêm mới hoặc Cập nhật)
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        setFormError(null);
        setLoading(true); // Có thể dùng state loading riêng cho form
        const token = localStorage.getItem('authToken');
        if (!token) {
            setFormError("Vui lòng đăng nhập lại.");
            setLoading(false);
            return;
        }

        try {
            if (isEditing && currentAddress) {
                // --- Cập nhật địa chỉ ---
                await axios.put(`http://localhost:8080/api/addresses/${currentAddress.id}`, formData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                alert('Cập nhật địa chỉ thành công!');
            } else {
                // --- Thêm địa chỉ mới ---
                await axios.post('http://localhost:8080/api/addresses', formData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                alert('Thêm địa chỉ mới thành công!');
            }
            // Reset form và tải lại danh sách
            resetForm();
            fetchAddresses(); // Tải lại danh sách sau khi thêm/sửa

        } catch (err) {
            console.error('Lỗi khi lưu địa chỉ:', err);
            if (err.response && err.response.data) {
                // Hiển thị lỗi validation từ backend nếu có
                const errorData = err.response.data;
                if (typeof errorData === 'object' && !errorData.message) { // Lỗi validation thường là object {field: message}
                    setFormError(Object.values(errorData).join(', '));
                } else {
                    setFormError(errorData.message || 'Đã xảy ra lỗi khi lưu.');
                }
            } else {
                setFormError('Không thể kết nối đến server.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Hàm mở form để sửa địa chỉ
    const handleEdit = (address) => {
        setIsEditing(true);
        setCurrentAddress(address);
        setFormData({ // Điền dữ liệu cũ vào form
            street: address.street,
            city: address.city,
            phoneNumber: address.phoneNumber,
            isDefault: address.isDefault
        });
        setFormError(null); // Xóa lỗi cũ
        window.scrollTo(0, 0); // Cuộn lên đầu trang để thấy form
    };

    // Hàm reset form về trạng thái thêm mới
    const resetForm = () => {
        setIsEditing(false);
        setCurrentAddress(null);
        setFormData({ street: '', city: '', phoneNumber: '', isDefault: false });
        setFormError(null);
    };

    // Hàm xử lý xóa địa chỉ
    const handleDelete = async (addressId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
            return;
        }
        setLoading(true); // Có thể dùng state loading riêng
        setError(null);
        const token = localStorage.getItem('authToken');
        if (!token) { /* ... xử lý lỗi ... */ return; }

        try {
            await axios.delete(`http://localhost:8080/api/addresses/${addressId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Xóa địa chỉ thành công!');
            fetchAddresses(); // Tải lại danh sách
        } catch (err) {
            console.error('Lỗi khi xóa địa chỉ:', err);
            setError('Không thể xóa địa chỉ.'); // Hiển thị lỗi chung
        } finally {
            setLoading(false);
        }
    };


    // --- Render Giao diện ---
    if (loading && addresses.length === 0) return <p className="loading-message">Đang tải địa chỉ...</p>; // Chỉ hiển thị loading ban đầu
    if (error && addresses.length === 0) return <p className="error-message">{error}</p>; // Chỉ hiển thị lỗi ban đầu

    return (
        <div className="address-page">
            <h1>Sổ Địa Chỉ</h1>

            {/* --- Form Thêm/Sửa Địa chỉ --- */}
            <div className="address-form-container">
                <h3>{isEditing ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
                <form onSubmit={handleFormSubmit}>
                    <div className="form-group">
                        <label htmlFor="street">Địa chỉ (Số nhà, Tên đường):</label>
                        <input type="text" id="street" name="street" value={formData.street} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="city">Tỉnh/Thành phố:</label>
                        <input type="text" id="city" name="city" value={formData.city} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phoneNumber">Số điện thoại:</label>
                        <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleFormChange} required />
                    </div>
                    {/* <div className="form-group checkbox-group">
                        <input type="checkbox" id="isDefault" name="isDefault" checked={formData.isDefault} onChange={handleFormChange} />
                        <label htmlFor="isDefault">Đặt làm địa chỉ mặc định</label>
                    </div> */}
                    {formError && <p className="error-message form-error">{formError}</p>}
                    <div className="form-buttons">
                        <button type="submit" disabled={loading}>{isEditing ? 'Cập nhật' : 'Thêm mới'}</button>
                        {isEditing && <button type="button" onClick={resetForm} className="cancel-button">Hủy sửa</button>}
                    </div>
                </form>
            </div>

            <hr className="divider" /> {/* Đường kẻ phân cách */}

            {/* --- Danh sách địa chỉ đã lưu --- */}
            <h2>Địa chỉ đã lưu</h2>
            {loading && <p>Đang tải lại...</p>} {/* Loading khi thêm/sửa/xóa */}
            {error && <p className="error-message">{error}</p>} {/* Lỗi khi tải lại */}

            {addresses.length === 0 && !loading && <p>Bạn chưa lưu địa chỉ nào.</p>}

            {addresses.map(addr => (
                <div key={addr.id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                    <div className="address-info">
                        <p><strong>Địa chỉ:</strong> {addr.street}, {addr.city}</p>
                        <p><strong>Số điện thoại:</strong> {addr.phoneNumber}</p>
                        {addr.isDefault && <span className="default-badge">Mặc định</span>}
                    </div>
                    <div className="address-actions">
                        <button onClick={() => handleEdit(addr)} className="edit-button">Sửa</button>
                        <button onClick={() => handleDelete(addr.id)} className="delete-button">Xóa</button>
                    </div>
                </div>
            ))}

        </div>
    );
}

export default AddressPage;