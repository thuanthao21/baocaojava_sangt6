// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import Banner from '../components/Banner'; // Import Banner
import './HomePage.css'; // Import CSS
import { Link, useSearchParams } from 'react-router-dom';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]); // State này là cấu trúc cây
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('id,asc');
  const [searchParams, setSearchParams] = useSearchParams();

  // useEffect chính: Lấy dữ liệu dựa trên URL params
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page') || '0', 10);
    const categoryFromUrl = searchParams.get('category') || null;
    const searchFromUrl = searchParams.get('search') || '';
    const sortFromUrl = searchParams.get('sort') || 'id,asc';
    const categoryId = categoryFromUrl ? parseInt(categoryFromUrl, 10) : null;

    setCurrentPage(pageFromUrl);
    setSelectedCategory(categoryId);
    setSearchTerm(searchFromUrl);
    setSortOption(sortFromUrl);

    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/categories');
        setCategories(response.data || []); // API trả về cấu trúc cây
      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
      }
    };

    const fetchProducts = async (pageToFetch, categoryToFetch, searchToFetch, sortToFetch) => {
      setLoading(true);
      setError(null);
      const size = 20;
      const [sortBy, sortOrder] = sortToFetch.split(',');
      const params = { page: pageToFetch, size: size, sortBy: sortBy, sortOrder: sortOrder };
      if (categoryToFetch !== null) params.categoryId = categoryToFetch;
      if (searchToFetch && searchToFetch.trim() !== '') params.search = searchToFetch.trim();

      try {
        const response = await axios.get('http://localhost:8080/api/products', { params });
        setProducts(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setCurrentPage(response.data.number || 0);
      } catch (err) {
        console.error("Lỗi khi gọi API sản phẩm:", err);
        setError('Không thể tải danh sách sản phẩm.');
      } finally {
        setLoading(false);
      }
    };

    if (categories.length === 0) {
      fetchCategories();
    }
    fetchProducts(pageFromUrl, categoryId, searchFromUrl, sortFromUrl);

  }, [searchParams, categories.length]);

  // Hàm cập nhật URLSearchParams
  const updateSearchParams = (newParams) => {
    const currentParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && value !== '0') {
        currentParams.set(key, value.toString());
      } else {
        currentParams.delete(key);
      }
    });
    if (newParams.page === 0) currentParams.delete('page');
    setSearchParams(currentParams);
  };

  // Hàm xử lý khi chọn một danh mục
  const handleCategoryChange = (categoryId) => {
    updateSearchParams({ category: categoryId, page: 0 });
  };

  const handlePageChange = (newPage) => updateSearchParams({ page: newPage });
  const handleSearchInputChange = (event) => setSearchTerm(event.target.value);
  const handleSearchSubmit = () => updateSearchParams({ search: searchTerm, page: 0 });
  const handleSortChange = (event) => {
    const newSortOption = event.target.value;
    setSortOption(newSortOption);
    updateSearchParams({ sort: newSortOption, page: 0 });
  };

  // Hàm render các nút phân trang
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);
    if (endPage === totalPages - 1) startPage = Math.max(0, totalPages - maxPagesToShow);
    if (startPage === 0) endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(<button key={i} onClick={() => handlePageChange(i)} disabled={i === currentPage} className={`pagination-button ${i === currentPage ? 'active' : ''}`}> {i + 1} </button>);
    }
    return (<div className="pagination-controls"> <button onClick={() => handlePageChange(0)} disabled={currentPage === 0} className="pagination-button prev-next">&laquo; Đầu</button> <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} className="pagination-button prev-next">&lsaquo; Trước</button> {startPage > 0 && <span className="pagination-ellipsis">...</span>} {pageNumbers} {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>} <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1} className="pagination-button prev-next">Sau &rsaquo;</button> <button onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage >= totalPages - 1} className="pagination-button prev-next">Cuối &raquo;</button> </div>);
  };

  // Hàm đệ quy để render Menu Con (Cấp 2)
  const renderSubmenu = (children) => {
    if (!children || children.length === 0) return null;

    return (
      <ul className="category-submenu">
        {children.map(child => (
          <li key={child.id} className="submenu-item">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Ngăn click vào cha
                handleCategoryChange(child.id);
              }}
              className={selectedCategory === child.id ? 'active' : ''}
            >
              {child.name}
            </button>
          </li>
        ))}
      </ul>
    );
  };

  // --- Render Giao diện Chính ---
  return (
    <div className="home-page">
      <h1>Khám phá Trang sức</h1>

      {/* 1. Menu Lọc Danh mục */}
      <div className="category-menu-container">
        <ul className="category-menu-bar">
          <li className="category-menu-item">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`category-menu-link ${selectedCategory === null ? 'active' : ''}`}
            >
              Tất cả Sản Phẩm
            </button>
          </li>
          {categories.map(category => (
            <li key={category.id} className="category-menu-item has-submenu">
              <button
                onClick={() => handleCategoryChange(category.id)}
                className={`category-menu-link ${selectedCategory === category.id ? 'active' : ''}`}
              >
                {category.name}
              </button>
              {renderSubmenu(category.children)}
            </li>
          ))}
        </ul>
      </div>

      {/* 2. Banner */}
      <Banner />

      {/* 3. Thanh Công cụ Tìm kiếm & Sắp xếp */}
      <div className="toolbar">
        <div className="search-bar">
          <input type="text" placeholder="Tìm kiếm sản phẩm..." value={searchTerm} onChange={handleSearchInputChange} onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()} className="search-input" />
          <button onClick={handleSearchSubmit} className="search-button">Tìm</button>
        </div>
        <div className="sort-options">
          <label htmlFor="sort">Sắp xếp theo:</label>
          <select id="sort" value={sortOption} onChange={handleSortChange} className="sort-select">
            <option value="id,asc">Mặc định</option>
            <option value="price,asc">Giá tăng dần</option>
            <option value="price,desc">Giá giảm dần</option>
            <option value="name,asc">Tên A-Z</option>
            <option value="name,desc">Tên Z-A</option>
          </select>
        </div>
      </div>

      {/* Loading và Error Messages */}
      {loading && <p className="loading-message">Đang tải sản phẩm...</p>}
      {error && <p className="error-message">{error}</p>}

      {/* 4. Danh sách Sản phẩm và Phân trang */}
      {!loading && !error && (
        <>
          <div className="product-list">
            {products.length === 0 ? (
              <p>Không tìm thấy sản phẩm nào phù hợp.</p>
            ) : (
              products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
}

export default HomePage;