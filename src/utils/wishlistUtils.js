// src/utils/wishlistUtils.js
import axios from 'axios';

// Biến cache đơn giản để lưu trữ wishlist (giảm gọi API)
let wishlistCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // Cache trong 5 phút

// Hàm lấy wishlist (từ cache hoặc API)
export const getWishlist = async (token) => {
    const now = Date.now();
    // Nếu có cache và chưa hết hạn, dùng cache
    if (wishlistCache && now - cacheTimestamp < CACHE_DURATION) {
        console.log("Using wishlist cache");
        return wishlistCache;
    }

    // Nếu không có cache hoặc hết hạn, gọi API
    console.log("Fetching wishlist from API");
    if (!token) return []; // Cần token để gọi API

    try {
        const response = await axios.get('http://localhost:8080/api/wishlist', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        // Lưu kết quả vào cache và cập nhật timestamp
        wishlistCache = response.data.map(product => ({ productId: product.id })); // Chỉ lưu ID vào cache cho đơn giản
        cacheTimestamp = now;
        console.log("Wishlist cache updated:", wishlistCache);
        return wishlistCache;
    } catch (error) {
        console.error("Lỗi khi lấy wishlist:", error);
        // Không cập nhật cache nếu lỗi
        return wishlistCache || []; // Trả về cache cũ (nếu có) hoặc mảng rỗng
    }
};

// Hàm thêm sản phẩm vào wishlist
export const addProductToWishlist = async (productId, token) => {
    if (!token) throw new Error("Authentication required");
    try {
        await axios.post(`http://localhost:8080/api/wishlist/${productId}`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        // Cập nhật cache (cách đơn giản là xóa cache để lần sau lấy lại)
        clearWishlistCache();
        console.log(`Product ${productId} added to wishlist`);
    } catch (error) {
        console.error(`Lỗi khi thêm sản phẩm ${productId} vào wishlist:`, error);
        throw error; // Ném lỗi ra để component xử lý
    }
};

// Hàm xóa sản phẩm khỏi wishlist
export const removeProductFromWishlist = async (productId, token) => {
    if (!token) throw new Error("Authentication required");
    try {
        await axios.delete(`http://localhost:8080/api/wishlist/${productId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        // Cập nhật cache
        clearWishlistCache();
        console.log(`Product ${productId} removed from wishlist`);
    } catch (error) {
        console.error(`Lỗi khi xóa sản phẩm ${productId} khỏi wishlist:`, error);
        throw error;
    }
};

// Hàm xóa cache (dùng khi thêm/xóa hoặc logout)
export const clearWishlistCache = () => {
    wishlistCache = null;
    cacheTimestamp = 0;
    console.log("Wishlist cache cleared");
};

// Hàm tiện ích để kiểm tra nhanh (không gọi API)
export const getCachedWishlist = () => {
    const now = Date.now();
    if (wishlistCache && now - cacheTimestamp < CACHE_DURATION) {
        return wishlistCache;
    }
    return null; // Cache không hợp lệ
}