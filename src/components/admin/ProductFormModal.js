// src/components/admin/ProductFormModal.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Modal.css';
import './Admin.css';

function ProductFormModal({ isOpen, onClose, productToEdit, onSuccess }) {
    const { token } = useAuth();
    const [categories, setCategories] = useState([]);

    // State cho dữ liệu form
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        quantity: 0,
        categoryId: '' // Sẽ luôn là String
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isEditing = !!productToEdit;

    const getAuthConfig = useCallback(() => ({
        headers: { 'Authorization': `Bearer ${token}` }
    }), [token]);

    // 1. Tải danh sách Category (Chỉ chạy 1 lần khi modal mở)
    useEffect(() => {
        const fetchCategories = async () => {
            if (!token) return;
            try {
                const response = await axios.get('http://localhost:8080/api/admin/categories', getAuthConfig());
                setCategories(response.data);
            } catch (err) {
                console.error("Lỗi tải categories:", err);
                setError("Không thể tải danh sách danh mục.");
            }
        };

        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen, getAuthConfig, token]); // Chỉ phụ thuộc vào việc modal mở

    // 2. Điền dữ liệu vào form (Chạy khi modal mở HOẶC khi category tải xong)
    useEffect(() => {
        if (isOpen) {
            setError(null);

            if (isEditing && productToEdit) {
                // CHẾ ĐỘ SỬA: Lấy dữ liệu từ productToEdit
                setFormData({
                    name: productToEdit.name || '',
                    description: productToEdit.description || '',
                    price: productToEdit.price || 0,
                    imageUrl: productToEdit.imageUrl || '',
                    quantity: productToEdit.quantity || 0,
                    // [SỬA LỖI] Chuyển Number sang String
                    categoryId: productToEdit.categoryId ? String(productToEdit.categoryId) : '',
                });
            } else {
                // CHẾ ĐỘ THÊM MỚI: Reset form
                setFormData({
                    name: '', description: '', price: 0, imageUrl: '', quantity: 0,
                    // [SỬA LỖI] Tự động chọn danh mục đầu tiên (dưới dạng String)
                    // Chỉ chạy KHI categories đã tải xong (categories.length > 0)
                    categoryId: categories.length > 0 ? String(categories[0].id) : '',
                });
            }
        }
        // Phụ thuộc vào [isOpen, productToEdit, categories]
        // Nó sẽ chạy lại khi categories tải xong, đảm bảo logic "Thêm mới" chọn đúng
    }, [isOpen, productToEdit, isEditing, categories]);


    // Hàm xử lý khi gõ vào form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            // [SỬA LỖI] Giữ categoryId là String, chỉ chuyển đổi các số khác
            [name]: (name === 'price' || name === 'quantity') ? Number(value) : value
        }));
    };

    // Hàm xử lý khi nhấn nút Lưu/Thêm
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Dữ liệu sẽ gửi lên API (DTO ProductRequest)
        // [SỬA LỖI] Chuyển categoryId (String) về Number trước khi gửi
        const apiData = {
            ...formData,
            categoryId: Number(formData.categoryId) // Chuyển đổi về Number cho backend
        };

        // Kiểm tra categoryId hợp lệ
        if (!apiData.categoryId) {
            setError("Vui lòng chọn một danh mục.");
            setLoading(false);
            return;
        }

        try {
            if (isEditing) {
                // --- SỬA (PUT) ---
                await axios.put(`http://localhost:8080/api/admin/products/${productToEdit.id}`, apiData, getAuthConfig());
                alert(`Cập nhật sản phẩm "${apiData.name}" thành công!`);
            } else {
                // --- THÊM (POST) ---
                await axios.post('http://localhost:8080/api/admin/products', apiData, getAuthConfig());
                alert(`Thêm sản phẩm "${apiData.name}" thành công!`);
            }

            onSuccess();
            onClose();

        } catch (err) {
            console.error('Lỗi khi submit form:', err.response || err);
            const errorMessage = err.response?.data?.message || err.response?.data || 'Đã xảy ra lỗi. Vui lòng thử lại.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        // Lớp phủ nền
        <div className="modal-overlay" onClick={onClose}>
            {/* Nội dung Modal, ngăn sự kiện click lan ra overlay */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>{isEditing ? 'Sửa Sản phẩm' : 'Thêm Sản phẩm Mới'}</h3>
                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleSubmit} className="product-form">

                    <div className="form-group">
                        <label htmlFor="name">Tên Sản phẩm:</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="categoryId">Danh mục:</label>
                        {/* Bây giờ value={formData.categoryId} (String) 
                            sẽ khớp với <option value={cat.id}> (cũng là String)
                        */}
                        <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Giá và Số lượng trên 1 hàng */}
                    <div className="form-group-row">
                        <div className="form-group half-width">
                            <label htmlFor="price">Giá (VND):</label>
                            <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} min="0" required />
                        </div>
                        <div className="form-group half-width">
                            <label htmlFor="quantity">Số lượng tồn kho:</label>
                            <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} min="0" required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="imageUrl">URL Ảnh (Link):</label>
                        <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} required />
                        {/* Hiển thị ảnh preview nếu có link */}
                        {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" style={{ maxWidth: '100%', height: 'auto', marginTop: '10px', border: '1px solid #ccc' }} />}
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Mô tả:</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows="5"></textarea>
                    </div>

                    <div className="modal-actions">
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Đang lưu...' : (isEditing ? 'Lưu Thay đổi' : 'Thêm Sản phẩm')}
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

export default ProductFormModal;