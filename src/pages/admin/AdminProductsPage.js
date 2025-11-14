// src/pages/admin/AdminProductsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ProductFormModal from '../../components/admin/ProductFormModal';
import '../../components/admin/Admin.css';

function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const { token } = useAuth();

    // [MỚI] State lưu danh sách danh mục (cho dropdown lọc)
    const [categories, setCategories] = useState([]);

    // [MỚI] State lưu giá trị tìm kiếm và lọc
    const [filters, setFilters] = useState({
        search: '',
        categoryId: '' // Luôn là string (hoặc rỗng)
    });

    const getAuthConfig = useCallback(() => ({
        headers: { 'Authorization': `Bearer ${token}` }
    }), [token]);

    // [MỚI] Ổn định hàm fetchCategories bằng useCallback
    const fetchCategories = useCallback(async () => {
        try {
            // Lấy danh mục phẳng cho mục đích lọc
            const response = await axios.get('http://localhost:8080/api/admin/categories', getAuthConfig());
            setCategories(response.data);
        } catch (err) {
            console.error("Lỗi khi tải danh mục lọc:", err);
        }
    }, [getAuthConfig]);


    // [CẬP NHẬT] Ổn định hàm fetchProducts bằng useCallback
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // [CẬP NHẬT] Xây dựng tham số query
            const params = {
                // Tận dụng tham số phân trang mặc định (page=0, size=10,...) nếu có
                // search: filters.search, 
                search: filters.search.trim() || undefined,
                // Chuyển categoryId thành Number/undefined trước khi gửi
                categoryId: filters.categoryId ? Number(filters.categoryId) : undefined
            };

            const response = await axios.get('http://localhost:8080/api/admin/products', {
                ...getAuthConfig(),
                params: params // Truyền tham số lọc/tìm kiếm
            });

            // Do backend trả về Page<ProductDto>, ta cần truy cập response.data.content
            const dataToSet = response.data.content ? response.data.content : response.data;


            if (Array.isArray(dataToSet)) {
                setProducts(dataToSet);
            } else {
                console.error("Dữ liệu API trả về không phải là mảng:", response.data);
                setError("Dữ liệu sản phẩm nhận được không hợp lệ.");
                setProducts([]);
            }
        } catch (err) {
            console.error("Lỗi khi tải sản phẩm:", err);
            setError("Không thể tải danh sách sản phẩm. Vui lòng kiểm tra quyền ADMIN.");
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [getAuthConfig, filters.search, filters.categoryId]); // Phụ thuộc vào filters


    // useEffect: Tải sản phẩm VÀ danh mục khi component được mount
    useEffect(() => {
        if (token) {
            fetchCategories(); // Tải danh mục (chỉ cần chạy 1 lần)
        }
    }, [token, fetchCategories]);

    useEffect(() => {
        if (token) {
            fetchProducts();
        }
    }, [token, fetchProducts]); // Chạy lại khi filters thay đổi


    // [MỚI] Xử lý thay đổi trong ô tìm kiếm/lọc
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        // Không gọi fetchProducts ở đây, mà để useEffect tự động chạy khi filters thay đổi
    };

    // ... (handleDelete, handleEdit, handleAdd, formatCurrency giữ nguyên) ...
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

        try {
            await axios.delete(`http://localhost:8080/api/admin/products/${id}`, getAuthConfig());
            alert("Xóa sản phẩm thành công!");
            fetchProducts();
        } catch (err) {
            console.error("Lỗi khi xóa sản phẩm:", err);
            alert(`Xóa thất bại: ${err.response?.data?.message || 'Lỗi không xác định'}`);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const formatCurrency = (amount) => {
        const num = amount ? parseFloat(amount) : 0;
        return num.toLocaleString('vi-VN') + ' đ';
    };

    if (loading) return <p className="loading-message">Đang tải danh sách sản phẩm...</p>;

    return (
        <div className="admin-page">
            {error && <p className="error-message">{error}</p>}

            <div className="admin-header">
                <h2>Quản lý Sản phẩm</h2>
                <button onClick={handleAdd} className="btn-primary">Thêm Sản phẩm Mới +</button>
            </div>

            {/* [MỚI] THANH TÌM KIẾM VÀ LỌC */}
            <div className="filter-bar">
                <input
                    type="text"
                    name="search"
                    placeholder="Tìm kiếm theo Tên hoặc Mô tả..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="filter-input"
                    style={{ marginRight: '15px', padding: '8px', width: '300px' }}
                />
                <select
                    name="categoryId"
                    value={filters.categoryId}
                    onChange={handleFilterChange}
                    className="filter-select"
                    style={{ padding: '8px' }}
                >
                    <option value="">-- Lọc theo Danh mục --</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                productToEdit={editingProduct}
                onSuccess={fetchProducts} // Callback để tải lại bảng
            />

            {/* Bảng hiển thị danh sách sản phẩm */}
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Ảnh</th>
                        <th>Tên Sản phẩm</th>
                        <th>Giá</th>
                        <th>SL Tồn</th>
                        <th>Danh mục</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td><img src={p.imageUrl} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} /></td>
                            <td>{p.name}</td>
                            <td>{formatCurrency(p.price)}</td>
                            <td>{p.quantity}</td>
                            <td>{p.categoryName ? p.categoryName : 'N/A'}</td>
                            <td>
                                <button onClick={() => handleEdit(p)} className="btn-secondary btn-sm">Sửa</button>
                                <button onClick={() => handleDelete(p.id)} className="btn-danger btn-sm">Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminProductsPage;