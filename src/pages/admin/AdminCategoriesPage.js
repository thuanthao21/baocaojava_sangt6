import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import '../../components/admin/Admin.css'; // Dùng chung CSS

// [SỬA 1] Import modal
import CategoryFormModal from '../../components/admin/CategoryFormModal';

function AdminCategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    // [SỬA 2] Kích hoạt state cho modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    // Hàm lấy config header
    const getAuthConfig = useCallback(() => ({
        headers: { 'Authorization': `Bearer ${token}` }
    }), [token]);

    // Hàm tải danh sách danh mục (dạng phẳng)
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:8080/api/admin/categories', getAuthConfig());
            setCategories(response.data);
        } catch (err) {
            console.error("Lỗi khi tải danh mục:", err);
            setError("Không thể tải danh sách danh mục.");
        } finally {
            setLoading(false);
        }
    }, [getAuthConfig]);

    // Tải danh mục khi component mount
    useEffect(() => {
        if (token) {
            fetchCategories();
        }
    }, [token, fetchCategories]);

    // Hàm xử lý Xóa
    const handleDelete = async (id, name) => {
        if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${name}"? \nLƯU Ý: Bạn không thể xóa nếu còn sản phẩm hoặc danh mục con.`)) return;

        try {
            await axios.delete(`http://localhost:8080/api/admin/categories/${id}`, getAuthConfig());
            alert(`Xóa danh mục "${name}" thành công!`);
            fetchCategories(); // Tải lại
        } catch (err) {
            console.error("Lỗi khi xóa danh mục:", err);
            alert(`Xóa thất bại: ${err.response?.data?.message || 'Lỗi không xác định'}`);
        }
    };

    // [SỬA 3] Kích hoạt hàm mở modal
    const handleEdit = (category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    if (loading) return <p className="loading-message">Đang tải danh mục...</p>;

    return (
        <div className="admin-page">
            {error && <p className="error-message">{error}</p>}

            <div className="admin-header">
                <h2>Quản lý Danh mục</h2>
                {/* [SỬA 4] Kích hoạt onClick */}
                <button onClick={handleAdd} className="btn-primary">Thêm Danh mục Mới +</button>
            </div>

            {/* [SỬA 5] Kích hoạt Modal */}
            <CategoryFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                categoryToEdit={editingCategory}
                onSuccess={() => {
                    fetchCategories(); // Tải lại bảng
                    // (Không cần gọi onClose ở đây vì modal tự đóng)
                }}
            />

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên Danh mục</th>
                        <th>ID Cha (Parent ID)</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((cat) => (
                        <tr key={cat.id}>
                            <td>{cat.id}</td>
                            <td>{cat.name}</td>
                            <td>{cat.parentId || 'N/A'}</td>
                            <td>
                                {/* [SỬA 6] Kích hoạt onClick */}
                                <button onClick={() => handleEdit(cat)} className="btn-secondary btn-sm">Sửa</button>
                                <button onClick={() => handleDelete(cat.id, cat.name)} className="btn-danger btn-sm">Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminCategoriesPage;