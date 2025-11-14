// src/pages/ProductDetailPage.js
import React, { useState, useEffect } from 'react';
// [GEMINI_VN]: Import thêm Link (useNavigate tạm thời bỏ)
import { useParams, Link /*, useNavigate */ } from 'react-router-dom';
import axios from 'axios';
import './ProductDetailPage.css';
import { addToCart } from '../utils/cartUtils';

function ProductDetailPage() {
  const { id: productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState('');

  // --- [GEMINI_VN]: State cho phần Đánh giá ---
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  // ---------------------------------------------

  // const navigate = useNavigate(); // [GEMINI_VN]: Tạm thời bỏ để hết warning

  // useEffect chính: Lấy thông tin sản phẩm VÀ danh sách đánh giá
  useEffect(() => {
    if (productId) {
      const fetchProductData = async () => {
        setLoading(true);
        setReviewLoading(true);
        setError(null);
        setReviewError(null);
        setAddedMessage('');

        try {
          // Gọi đồng thời 2 API
          const [productResponse, reviewsResponse] = await Promise.all([
            axios.get(`http://localhost:8080/api/products/${productId}`),
            axios.get(`http://localhost:8080/api/products/${productId}/reviews`)
          ]);

          setProduct(productResponse.data);
          setReviews(reviewsResponse.data || []);
          console.log('Product Detail Response:', productResponse.data);
          console.log('Reviews Response:', reviewsResponse.data);

        } catch (err) {
          console.error(`Lỗi khi tải dữ liệu sản phẩm ${productId}:`, err);
          if (err.response && err.response.status === 404) {
            setError('Không tìm thấy sản phẩm.');
          } else if (err.code === 'ERR_NETWORK') {
            setError('Không thể kết nối đến server backend.');
          } else {
            setError('Không thể tải thông tin sản phẩm.');
          }
        } finally {
          setLoading(false);
          setReviewLoading(false);
        }
      };
      fetchProductData();
    } else {
      setError('ID sản phẩm không hợp lệ.');
      setLoading(false);
    }
  }, [productId]);

  // Hàm thêm vào giỏ hàng (không đổi)
  const handleAddToCart = () => {
    if (product && quantity > 0) {
      addToCart(product, quantity);
      setAddedMessage(`${quantity} x "${product.name}" đã được thêm vào giỏ!`);
      setTimeout(() => setAddedMessage(''), 3000);
      setQuantity(1);
    } else if (quantity <= 0) {
      setAddedMessage('Số lượng phải lớn hơn 0.');
      setTimeout(() => setAddedMessage(''), 3000);
    }
  };

  // [GEMINI_VN]: Hàm xử lý khi người dùng gửi đánh giá mới
  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewLoading(true);
    setReviewError(null);

    const token = localStorage.getItem('authToken');
    if (!token) {
      setReviewError('Bạn cần đăng nhập để gửi đánh giá.');
      setReviewLoading(false);
      // navigate(`/login?redirect=/products/${productId}`); // Tạm thời bỏ
      return;
    }

    const reviewData = {
      rating: newRating,
      comment: newComment
    };

    try {
      const response = await axios.post(
        `http://localhost:8080/api/products/${productId}/reviews`,
        reviewData,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // [GEMINI_VN]: SỬA LỖI: Dùng console.log
      console.log("<<< Review added successfully with ID:", response.data.id);
      setReviews([response.data, ...reviews]);
      setNewRating(5);
      setNewComment('');
      setReviewLoading(false);
      alert('Gửi đánh giá thành công!');

    } catch (err) {
      console.error('Lỗi khi gửi đánh giá:', err);
      if (err.response) {
        if (err.response.status === 401) {
          setReviewError('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
        } else if (err.response.status === 400) {
          setReviewError(err.response.data?.message || 'Dữ liệu đánh giá không hợp lệ.');
        } else if (err.response.status === 403) {
          setReviewError(err.response.data?.message || 'Bạn không có quyền thực hiện hành động này.');
        } else {
          setReviewError('Không thể gửi đánh giá vào lúc này. Lỗi server.');
        }
      } else if (err.request) {
        setReviewError('Không thể kết nối đến máy chủ.');
      } else {
        setReviewError('Đã có lỗi không mong muốn xảy ra.');
      }
      setReviewLoading(false);
    }
  };


  // --- Render Giao diện ---
  if (loading) {
    return <div className="loading-message">Đang tải thông tin sản phẩm...</div>;
  }
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  if (!product) {
    return <p>Không có thông tin sản phẩm.</p>;
  }

  const isLoggedIn = !!localStorage.getItem('authToken');

  return (
    <div className="product-detail-page">
      <div className="product-detail-image-container">
        <img src={product.imageUrl || 'https://via.placeholder.com/400'} alt={product.name} className="product-detail-image" />
      </div>

      <div className="product-detail-info">
        <h1 className="product-detail-name">{product.name}</h1>
        <p className="product-detail-price">
          {product.price ? product.price.toLocaleString('vi-VN') + ' đ' : 'Liên hệ'}
        </p>
        <p className="product-detail-category">
          <strong>Danh mục:</strong> {product.categoryName || 'N/A'}
        </p>
        <div className="product-detail-description">
          <h3>Mô tả sản phẩm</h3>
          <p>{product.description || 'Chưa có mô tả chi tiết.'}</p>
        </div>

        <div className="quantity-selector">
          <label htmlFor="quantity">Số lượng:</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            min="1"
            className="quantity-input"
          />
        </div>

        <button className="add-to-cart-button" onClick={handleAddToCart}>
          Thêm vào giỏ hàng
        </button>
        {addedMessage && <p className="added-message">{addedMessage}</p>}

        {/* --- Phần Đánh giá Sản phẩm --- */}
        <div className="product-reviews-section">
          <h3>Đánh giá sản phẩm ({reviews.length})</h3>

          {/* Form gửi đánh giá mới */}
          {isLoggedIn && (
            <form onSubmit={handleReviewSubmit} className="review-form">
              <h4>Gửi đánh giá của bạn</h4>
              {reviewError && <p className="error-message">{reviewError}</p>}
              <div className="form-group rating-group">
                <label htmlFor="rating">Điểm:</label>
                <select id="rating" value={newRating} onChange={(e) => setNewRating(parseInt(e.target.value))}>
                  <option value={5}>5 sao ⭐⭐⭐⭐⭐</option>
                  <option value={4}>4 sao ⭐⭐⭐⭐</option>
                  <option value={3}>3 sao ⭐⭐⭐</option>
                  <option value={2}>2 sao ⭐⭐</option>
                  <option value={1}>1 sao ⭐</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="comment">Bình luận:</label>
                <textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  required
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                ></textarea>
              </div>
              <button type="submit" disabled={reviewLoading}>
                {reviewLoading ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          )}
          {/* Link đăng nhập */}
          {!isLoggedIn && (
            <p className="login-prompt">
              Vui lòng <Link to={`/login?redirect=/products/${productId}`}>đăng nhập</Link> để gửi đánh giá của bạn.
            </p>
          )}

          {/* Danh sách đánh giá */}
          <div className="review-list">
            {reviewLoading && !loading && <p>Đang tải đánh giá...</p>}
            {!reviewLoading && reviews.length === 0 && <p>Chưa có đánh giá nào cho sản phẩm này.</p>}
            {!reviewLoading && reviews.map(review => (
              <div key={review.id} className="review-item">
                <p className="review-rating">{'⭐'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                <p className="review-comment">{review.comment}</p>
                <p className="review-meta">
                  Bởi: <strong>{review.username || 'Người dùng ẩn'}</strong> vào {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        </div>
        {/* --- Hết Phần Đánh giá --- */}
      </div>
    </div>
  );
}

export default ProductDetailPage;