// src/components/Banner.js
import React from 'react';
import './Banner.css'; // File CSS riêng cho Banner
import myNewBannerImage from '../assets/images/banner1.png';

function Banner() {
    // Bạn có thể thay đổi ảnh và nội dung ở đây
    const bannerImageUrl = myNewBannerImage;

    return (
        <div className="banner-container">
            <img src={bannerImageUrl} alt="Banner Khuyến Mãi" className="banner-image" />
            {/* Có thể thêm chữ hoặc nút bấm lên trên banner nếu muốn */}
            {/* <div className="banner-content">
        <h2>Bộ Sưu Tập Mới</h2>
        <button>Khám phá ngay</button>
      </div> */}
        </div>
    );
}

export default Banner;