// src/components/admin/CategoryFormModal.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Modal.css';
import './Admin.css';

function CategoryFormModal({ isOpen, onClose, categoryToEdit, onSuccess }) {
    const { token } = useAuth();
    // State này sẽ giữ danh sách tất cả category (để làm dropdown "Cha")
    const [allCategories, setAllCategories] = useState([]);

    // State cho dữ liệu form
    const [formData, setFormData] = useState({
        name: '',
        parentId: '' // Sẽ luôn là String
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isEditing = !!categoryToEdit;

    const getAuthConfig = useCallback(() => ({
        headers: { 'Authorization': `Bearer ${token}` }
    }), [token]);

    // 1. Tải danh sách Category (cho dropdown "Cha")
    useEffect(() => {
        const fetchCategories = async () => {
            if (!token) return;
            try {
                // Chúng ta dùng API admin/categories (dạng phẳng)
                const response = await axios.get('http://localhost:8080/api/admin/categories', getAuthConfig());
                setAllCategories(response.data);
            } catch (err) {
                console.error("Lỗi tải categories:", err);
                setError("Không thể tải danh sách danh mục.");
            }
        };

        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen, getAuthConfig, token]);

    // 2. Điền dữ liệu vào form khi Sửa hoặc Thêm
    useEffect(() => {
        if (isOpen) {
            setError(null);

            if (isEditing && categoryToEdit) {
                // CHẾ ĐỘ SỬA
                setFormData({
                    name: categoryToEdit.name || '',
                    // Chuyển Number (parentId) sang String
                    parentId: categoryToEdit.parentId ? String(categoryToEdit.parentId) : '',
                });
            } else {
                // CHẾ ĐỘ THÊM MỚI
                setFormData({
                    name: '',
                    parentId: '', // Mặc định là không có cha (danh mục gốc)
                });
            }
        }
    }, [isOpen, categoryToEdit, isEditing]); // Bỏ 'allCategories' ra khỏi đây


    // Hàm xử lý khi gõ vào form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Hàm xử lý khi nhấn nút Lưu/Thêm
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Chuẩn bị dữ liệu gửi đi
        const apiData = {
            name: formData.name,
            // Chuyển 'parentId' từ String về Number (hoặc null nếu là rỗng)
            parentId: formData.parentId ? Number(formData.parentId) : null
        };

        // Kiểm tra logic: Không được tự làm cha của chính mình
        if (isEditing && categoryToEdit.id === apiData.parentId) {
            setError("Một danh mục không thể tự làm cha của chính nó.");
            setLoading(false);
            return;
        }

        try {
            if (isEditing) {
                // --- SỬA (PUT) ---
                await axios.put(`http://localhost:8080/api/admin/categories/${categoryToEdit.id}`, apiData, getAuthConfig());
                alert(`Cập nhật danh mục "${apiData.name}" thành công!`);
            } else {
                // --- THÊM (POST) ---
                await axios.post('http://localhost:8080/api/admin/categories', apiData, getAuthConfig());
                alert(`Thêm danh mục "${apiData.name}" thành công!`);
            }

            onSuccess(); // Tải lại bảng
            onClose();   // Đóng modal

        } catch (err) {
            console.error('Lỗi khi submit form:', err.response || err);
            const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>{isEditing ? 'Sửa Danh mục' : 'Thêm Danh mục Mới'}</h3>
                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleSubmit} className="product-form">

                    <div className="form-group">
                        <label htmlFor="name">Tên Danh mục:</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="parentId">Danh mục cha (Bỏ trống nếu là danh mục gốc):</label>
                        <select id="parentId" name="parentId" value={formData.parentId} onChange={handleChange}>
                            <option value="">-- (Không có) --</option>
                            {allCategories.map((cat) => (
                                // Lọc để không hiển thị chính danh mục đang sửa
                                // (Tránh trường hợp tự chọn mình làm cha)
                                isEditing && cat.id === categoryToEdit.id ? null : (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                )
                            ))}
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Đang lưu...' : (isEditing ? 'Lưu Thay đổi' : 'Thêm Mới')}
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

export default CategoryFormModal;