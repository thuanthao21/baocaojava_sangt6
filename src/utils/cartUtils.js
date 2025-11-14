// src/utils/cartUtils.js

// Lấy giỏ hàng từ localStorage
export const getCartItems = () => {
    try {
        const items = localStorage.getItem('cartItems');
        return items ? JSON.parse(items) : [];
    } catch (error) {
        console.error("Lỗi khi đọc giỏ hàng từ localStorage:", error);
        return []; // Trả về mảng rỗng nếu có lỗi
    }
};

// Lưu giỏ hàng vào localStorage
const saveCartItems = (cartItems) => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
};

// Thêm sản phẩm vào giỏ (hoặc tăng số lượng)
export const addToCart = (product, quantity = 1) => {
    const cartItems = getCartItems();
    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const existingItemIndex = cartItems.findIndex(item => item.productId === product.id);

    if (existingItemIndex > -1) {
        // Nếu đã có, tăng số lượng
        cartItems[existingItemIndex].quantity += quantity;
    } else {
        // Nếu chưa có, thêm mới vào mảng
        cartItems.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: quantity
        });
    }
    saveCartItems(cartItems); // Lưu lại vào localStorage
    console.log("Giỏ hàng sau khi thêm:", cartItems);
};

// Cập nhật số lượng sản phẩm trong giỏ
export const updateCartQuantity = (productId, quantity) => {
    let cartItems = getCartItems();
    const itemIndex = cartItems.findIndex(item => item.productId === productId);

    if (itemIndex > -1) {
        if (quantity > 0) {
            cartItems[itemIndex].quantity = quantity;
        } else {
            // Nếu số lượng <= 0, xóa sản phẩm khỏi giỏ
            cartItems = cartItems.filter(item => item.productId !== productId);
        }
        saveCartItems(cartItems);
        console.log("Giỏ hàng sau khi cập nhật:", cartItems);
    }
};

// Xóa sản phẩm khỏi giỏ
export const removeFromCart = (productId) => {
    let cartItems = getCartItems();
    cartItems = cartItems.filter(item => item.productId !== productId);
    saveCartItems(cartItems);
    console.log("Giỏ hàng sau khi xóa:", cartItems);
};

// Xóa toàn bộ giỏ hàng (sau khi đặt hàng thành công)
export const clearCart = () => {
    localStorage.removeItem('cartItems');
    console.log("Giỏ hàng đã được xóa.");
};

// Tính tổng tiền giỏ hàng
export const getCartTotal = () => {
    const cartItems = getCartItems();
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
};