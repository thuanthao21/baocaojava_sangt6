// src/components/ProductCard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { getCachedWishlist, addProductToWishlist, removeProductFromWishlist, getWishlist } from '../utils/wishlistUtils';
import './ProductCard.css';

function ProductCard({ product }) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false); // Đổi tên biến loading

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    let isMounted = true; // Biến cờ để tránh cập nhật state nếu component đã unmount

    const checkWishlistStatus = async () => {
      if (token && product) {
        let currentWishlist = getCachedWishlist(); // Lấy từ cache trước

        // [GEMINI_VN]: SỬA LỖI - Kiểm tra xem cache có phải là mảng không
        if (Array.isArray(currentWishlist)) {
          if (isMounted) {
            setIsInWishlist(currentWishlist.some(item => item.productId === product.id));
          }
        } else {
          // Nếu cache không hợp lệ hoặc rỗng, gọi API để lấy dữ liệu mới nhất
          try {
            currentWishlist = await getWishlist(token); // Gọi hàm async
            if (isMounted && Array.isArray(currentWishlist)) {
              setIsInWishlist(currentWishlist.some(item => item.productId === product.id));
            } else if (isMounted) {
              setIsInWishlist(false); // Nếu API trả về không phải mảng
            }
          } catch (error) {
            console.error("Lỗi khi kiểm tra wishlist status:", error);
            if (isMounted) setIsInWishlist(false); // Đặt là false nếu có lỗi
          }
        }
      } else {
        if (isMounted) setIsInWishlist(false); // Không đăng nhập thì chắc chắn là false
      }
    };

    checkWishlistStatus();

    // Hàm cleanup để tránh cập nhật state trên component đã unmount
    return () => {
      isMounted = false;
    };

  }, [product]); // Chạy lại khi product thay đổi

  // Hàm xử lý khi nhấn nút trái tim
  const handleWishlistToggle = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Vui lòng đăng nhập để sử dụng chức năng yêu thích!');
      return;
    }

    setLoadingWishlist(true); // Bắt đầu loading
    const currentlyInWishlist = isInWishlist; // Lưu trạng thái hiện tại

    try {
      if (currentlyInWishlist) {
        await removeProductFromWishlist(product.id, token);
        // Cập nhật state ngay lập tức để UI phản hồi nhanh
        setIsInWishlist(false);
      } else {
        await addProductToWishlist(product.id, token);
        // Cập nhật state ngay lập tức
        setIsInWishlist(true);
      }
      // Không cần clear cache ở đây vì hàm add/remove đã làm rồi
    } catch (error) {
      console.error("Lỗi khi cập nhật wishlist:", error);
      alert('Đã xảy ra lỗi khi cập nhật danh sách yêu thích.');
      // Nếu lỗi, rollback lại trạng thái UI
      setIsInWishlist(currentlyInWishlist);
    } finally {
      setLoadingWishlist(false); // Kết thúc loading
    }
  };


  return (
    <Link to={`/products/${product.id}`} className="product-card-link">
      <div className="product-card">
        <button
          className={`wishlist-button ${isInWishlist ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          disabled={loadingWishlist} // Sử dụng state loading riêng
          aria-label={isInWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
        >
          {/* Icon SVG trái tim */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        <img
          src={product.imageUrl || 'https://via.placeholder.com/200'}
          alt={product.name}
          className="product-card-image"
        />
        <h2 className="product-card-name">{product.name}</h2>
        <p className="product-card-price">
          {product.price ? product.price.toLocaleString('vi-VN') + ' đ' : 'Liên hệ'}
        </p>
      </div>
    </Link>
  );
}

export default ProductCard;