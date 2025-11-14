// src/pages/CartPage.js
import React, { useState, useEffect } from 'react';
import { getCartItems, updateCartQuantity, removeFromCart, getCartTotal, clearCart } from '../utils/cartUtils';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CartPage.css'; // Đảm bảo đã import CSS (bao gồm cả style cho địa chỉ)
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useAuth } from '../context/AuthContext'; // Import useAuth để lấy token

// Tỷ giá USD (ví dụ)
const USD_RATE = 25000;

function CartPage() {
    const [cartItems, setCartItems] = useState(getCartItems());
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [{ isPending }] = usePayPalScriptReducer();
    const { token } = useAuth(); // Lấy token từ context

    // [GEMINI_VN]: State mới để lưu địa chỉ
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loadingAddresses, setLoadingAddresses] = useState(true);

    // [GEMINI_VN]: Tải danh sách địa chỉ của người dùng
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!token) {
                setLoadingAddresses(false);
                setError("Vui lòng đăng nhập để xem địa chỉ và thanh toán.");
                return;
            }
            try {
                const response = await axios.get('http://localhost:8080/api/addresses', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const savedAddresses = response.data || [];
                setAddresses(savedAddresses);

                // Tự động chọn địa chỉ mặc định (nếu có)
                const defaultAddress = savedAddresses.find(addr => addr.isDefault);
                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress.id);
                } else if (savedAddresses.length > 0) {
                    // Hoặc chọn địa chỉ đầu tiên
                    setSelectedAddressId(savedAddresses[0].id);
                }
            } catch (err) {
                console.error('Lỗi khi lấy địa chỉ:', err);
                setError('Không thể tải danh sách địa chỉ.');
            } finally {
                setLoadingAddresses(false);
            }
        };

        fetchAddresses();
    }, [token]); // Chạy lại khi có token

    // --- Các hàm xử lý giỏ hàng (Không đổi) ---
    const handleQuantityChange = (productId, newQuantity) => {
        updateCartQuantity(productId, newQuantity);
        setCartItems(getCartItems());
    };
    const handleRemoveItem = (productId) => {
        removeFromCart(productId);
        setCartItems(getCartItems());
    };
    // -----------------------------------------

    const totalAmountVND = getCartTotal();
    const totalAmountUSD = (totalAmountVND / USD_RATE).toFixed(2);


    // --- Hàm PayPal 1: createOrder (Không đổi) ---
    const createOrder = (data, actions) => {
        setError(null);
        if (parseFloat(totalAmountUSD) <= 0.01) {
            setError("Tổng tiền quá nhỏ để thanh toán.");
            return Promise.reject(new Error("Tổng tiền bằng 0"));
        }

        // [GEMINI_VN]: Kiểm tra lại địa chỉ trước khi mở popup PayPal
        if (!selectedAddressId) {
            setError("Vui lòng chọn địa chỉ giao hàng trước.");
            return Promise.reject(new Error("Chưa chọn địa chỉ"));
        }

        console.log("Tạo đơn hàng PayPal với tổng tiền:", totalAmountUSD, "USD");
        return actions.order.create({
            purchase_units: [
                {
                    description: "Mua hàng trang sức tại Spring Jewels",
                    amount: {
                        currency_code: "USD",
                        value: totalAmountUSD,
                    },
                },
            ],
        });
    };

    // --- Hàm PayPal 2: onApprove (Cập nhật) ---
    const onApprove = (data, actions) => {
        console.log("Thanh toán PayPal thành công!", data);
        return actions.order.capture().then((details) => {
            console.log("Chi tiết thanh toán:", details);

            // 1. Kiểm tra lại lần cuối xem đã chọn địa chỉ chưa
            if (!selectedAddressId) {
                setError("Địa chỉ giao hàng không hợp lệ. Vui lòng thử lại.");
                return;
            }

            // 2. Tìm đối tượng địa chỉ đã chọn
            const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
            if (!selectedAddress) {
                setError("Địa chỉ đã chọn không hợp lệ. Vui lòng tải lại trang.");
                return;
            }

            // 3. Gọi hàm lưu đơn hàng với địa chỉ đã chọn
            handleCreateOrderInBackend(details, selectedAddress);
        });
    };

    // --- Hàm PayPal 3: onError (Không đổi) ---
    const onError = (err) => {
        console.error("Lỗi thanh toán PayPal:", err);
        setError("Đã xảy ra lỗi trong quá trình thanh toán hoặc bạn đã hủy giao dịch.");
    };


    // [GEMINI_VN]: Hàm 4: Gọi API backend (Đã cập nhật)
    // Nhận 'selectedAddress' làm tham số
    const handleCreateOrderInBackend = async (paypalDetails, selectedAddress) => {
        if (!token) {
            setError("Lỗi xác thực. Vui lòng đăng nhập lại.");
            return;
        }

        // Định dạng chuỗi địa chỉ từ đối tượng địa chỉ đã chọn
        const formattedAddress = `${selectedAddress.street}, ${selectedAddress.city} (SĐT: ${selectedAddress.phoneNumber})`;

        const orderData = {
            shippingAddress: formattedAddress, // Dùng địa chỉ đã chọn
            items: cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            })),
        };

        try {
            const response = await axios.post('http://localhost:8080/api/orders', orderData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            clearCart();
            setCartItems([]);
            alert(`Đặt hàng thành công! Mã đơn hàng của bạn là: ${response.data.id}`);
            navigate('/my-profile/orders');

        } catch (err) {
            console.error('Lỗi khi lưu đơn hàng vào backend:', err);
            setError('Thanh toán PayPal thành công nhưng lưu đơn hàng thất bại. Vui lòng liên hệ hỗ trợ.');
        }
    };

    // --- Render Giao diện ---
    return (
        <div className="cart-page">
            <h1>Giỏ hàng và Thanh toán</h1>

            {error && <p className="error-message" style={{ textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

            {cartItems.length === 0 ? (
                <p>Giỏ hàng của bạn đang trống. <Link to="/">Tiếp tục mua sắm</Link></p>
            ) : (
                <>
                    {/* [GEMINI_VN]: PHẦN CHỌN ĐỊA CHỈ */}
                    <div className="shipping-address-section">
                        <h2>Chọn Địa chỉ Giao hàng</h2>
                        {loadingAddresses ? (
                            <p>Đang tải địa chỉ của bạn...</p>
                        ) : addresses.length === 0 ? (
                            <p>Bạn chưa có địa chỉ nào.
                                <Link to="/my-profile/addresses" className="add-address-link" style={{ marginLeft: '5px' }}>Thêm địa chỉ mới</Link>
                            </p>
                        ) : (
                            <div className="address-list">
                                {addresses.map(addr => (
                                    <div key={addr.id} className="address-option">
                                        <input
                                            type="radio"
                                            name="shippingAddress"
                                            id={`addr-${addr.id}`}
                                            value={addr.id}
                                            checked={selectedAddressId === addr.id} // Kiểm tra theo ID
                                            onChange={() => setSelectedAddressId(addr.id)} // Cập nhật ID đã chọn
                                        />
                                        <label htmlFor={`addr-${addr.id}`}>
                                            <strong>{addr.street}, {addr.city}</strong>
                                            <p>{addr.phoneNumber} {addr.isDefault && <span className="default-badge">(Mặc định)</span>}</p>
                                        </label>
                                    </div>
                                ))}
                                <Link to="/my-profile/addresses" className="add-address-link">+ Thêm hoặc quản lý địa chỉ</Link>
                            </div>
                        )}
                    </div>

                    {/* Bảng giỏ hàng (giữ nguyên) */}
                    <table className="cart-table">
                        <thead>
                            <tr>
                                <th className="cart-header-image">Hình ảnh</th>
                                <th>Sản phẩm</th>
                                <th>Đơn giá</th>
                                <th>Số lượng</th>
                                <th>Thành tiền</th>
                                <th>Xóa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map(item => (
                                <tr key={item.productId} className="cart-item">
                                    <td className="cart-item-image"><img src={item.imageUrl || 'https://via.placeholder.com/50'} alt={item.name} /></td>
                                    <td className="cart-item-name"><Link to={`/products/${item.productId}`}>{item.name}</Link></td>
                                    <td className="cart-item-price">{item.price?.toLocaleString('vi-VN')} đ</td>
                                    <td className="cart-item-quantity">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 0)}
                                            min="0"
                                        />
                                    </td>
                                    <td className="cart-item-subtotal">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</td>
                                    <td className="cart-item-remove"><button onClick={() => handleRemoveItem(item.productId)}>Xóa</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Tổng kết và Thanh toán */}
                    <div className="cart-summary">
                        <h2>Tổng cộng: {totalAmountVND.toLocaleString('vi-VN')} đ</h2>

                        {isPending && <div className="loading-message">Đang tải thanh toán...</div>}

                        {!isPending && totalAmountVND > 0 && (
                            <PayPalButtons
                                style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                                // Vô hiệu hóa nút nếu CHƯA chọn địa chỉ
                                disabled={!selectedAddressId || addresses.length === 0}
                                forceReRender={[totalAmountUSD, selectedAddressId]} // Render lại nút nếu địa chỉ thay đổi
                                createOrder={createOrder}
                                onApprove={onApprove}
                                onError={onError}
                            />
                        )}
                        {/* Thông báo nếu chưa chọn địa chỉ */}
                        {addresses.length > 0 && !selectedAddressId &&
                            <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>Vui lòng chọn một địa chỉ để thanh toán.</p>
                        }
                    </div>
                </>
            )}
        </div>
    );
}

export default CartPage;