// src/main/java/com/doan2/nguyenthuanthao_doan/service/OrderService.java
package com.doan2.nguyenthuanthao_doan.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.doan2.nguyenthuanthao_doan.dto.CreateOrderRequest;
import com.doan2.nguyenthuanthao_doan.dto.OrderDetailDto;
import com.doan2.nguyenthuanthao_doan.dto.OrderDto;
import com.doan2.nguyenthuanthao_doan.dto.UpdateOrderAddressRequest;
import com.doan2.nguyenthuanthao_doan.dto.UpdateOrderStatusRequest;
import com.doan2.nguyenthuanthao_doan.entity.Order;
import com.doan2.nguyenthuanthao_doan.entity.OrderDetail;
import com.doan2.nguyenthuanthao_doan.entity.Product;
import com.doan2.nguyenthuanthao_doan.entity.User;
import com.doan2.nguyenthuanthao_doan.exception.ResourceNotFoundException;
import com.doan2.nguyenthuanthao_doan.repository.OrderRepository;
import com.doan2.nguyenthuanthao_doan.repository.ProductRepository;
import com.doan2.nguyenthuanthao_doan.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /**
     * Chuyển đổi một Order Entity sang OrderDto.
     */
private OrderDto convertToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderDate(order.getOrderDate());
        dto.setStatus(order.getStatus());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setShippingAddress(order.getShippingAddress());

        // [SỬA LỖI N+1 TRUY CẬP USER]
        if (order.getUser() != null) {
            try {
                // Do chúng ta dùng JOIN FETCH user, truy cập này an toàn
                dto.setUserId(order.getUser().getId());
                dto.setUsername(order.getUser().getUsername()); 
            } catch (jakarta.persistence.EntityNotFoundException e) {
                // Xử lý nếu user bị xóa nhưng khóa ngoại vẫn còn
                dto.setUserId(order.getUser().getId());
                dto.setUsername("Người dùng đã bị xóa");
            }
        } else {
            dto.setUserId(null);
            dto.setUsername("Khách vãng lai");
        }

        // Chuyển đổi Set<OrderDetail> sang Set<OrderDetailDto>
        // (Phần này an toàn nếu Repository đã JOIN FETCH OrderDetails và Product)
        Set<OrderDetailDto> detailDtos = order.getOrderDetails().stream().map(detail -> {
            OrderDetailDto detailDto = new OrderDetailDto();
            
if (detail.getProduct() != null) { // <--- Logic này sẽ được kích hoạt
                try {
                    detailDto.setProductId(detail.getProduct().getId());
                    detailDto.setProductName(detail.getProduct().getName());
                } catch (jakarta.persistence.EntityNotFoundException e) {
                    // ...
                }
            } else {
                // <--- Logic này sẽ được gọi cho Product ID 8
                detailDto.setProductId(null);
                detailDto.setProductName("Sản phẩm không xác định");
            }            
            detailDto.setQuantity(detail.getQuantity());
            detailDto.setPrice(detail.getPrice());
            return detailDto;
        }).collect(Collectors.toSet());
        
        dto.setOrderDetails(detailDtos);

        return dto;
    }
    /**
     * Tạo một đơn hàng mới cho người dùng đang được xác thực.
     */
    @Transactional
    public OrderDto createOrder(CreateOrderRequest request) {
        logger.info("Đang xử lý tạo đơn hàng với request: {}", request);

        // 1. Lấy thông tin người dùng đang đăng nhập
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            logger.error("Người dùng chưa được xác thực. Không thể tạo đơn hàng.");
            throw new IllegalStateException("Người dùng phải được xác thực để tạo đơn hàng.");
        }
        String username = authentication.getName();
        logger.info("Username người dùng hiện tại: {}", username);

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.error("Không tìm thấy người dùng '{}' trong CSDL.", username);
                    return new ResourceNotFoundException("Không tìm thấy người dùng: " + username);
                });
        logger.info("Đã tìm thấy người dùng với ID: {}", currentUser.getId());

        // 2. Tạo đối tượng Order chính
        Order order = new Order();
        order.setUser(currentUser);
        order.setStatus("PENDING"); // Trạng thái ban đầu
        order.setShippingAddress(request.getShippingAddress());
        // Set<OrderDetail> đã được khởi tạo trong Entity

        BigDecimal totalAmount = BigDecimal.ZERO;

        // 3. Xử lý từng sản phẩm trong request
        logger.info("Đang xử lý {} sản phẩm cho đơn hàng...", request.getItems() != null ? request.getItems().size() : 0);
        if (request.getItems() == null || request.getItems().isEmpty()) {
            logger.error("Yêu cầu đặt hàng không chứa sản phẩm nào.");
            throw new IllegalArgumentException("Đơn hàng phải chứa ít nhất một sản phẩm.");
        }

        for (CreateOrderRequest.OrderItemDto itemDto : request.getItems()) {
            logger.info("Đang xử lý sản phẩm - Product ID: {}, Số lượng: {}", itemDto.getProductId(), itemDto.getQuantity());
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> {
                        logger.error("Không tìm thấy sản phẩm với ID {}.", itemDto.getProductId());
                        return new ResourceNotFoundException("Không tìm thấy sản phẩm với id: " + itemDto.getProductId());
                    });
            logger.info("Đã tìm thấy sản phẩm '{}' với giá {}", product.getName(), product.getPrice());
            
            if (product.getPrice() == null) {
                logger.error("Sản phẩm ID {} ('{}') có giá là null!", product.getId(), product.getName());
                throw new IllegalStateException("Giá sản phẩm không được null cho sản phẩm ID: " + product.getId());
            }

            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setOrder(order);
            orderDetail.setProduct(product);
            orderDetail.setQuantity(itemDto.getQuantity());
            orderDetail.setPrice(product.getPrice());

            order.getOrderDetails().add(orderDetail);
            logger.debug("Đã thêm OrderDetail cho sản phẩm ID {}", product.getId());

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            logger.debug("Tổng tiền sản phẩm này: {}", itemTotal);
            totalAmount = totalAmount.add(itemTotal);
            logger.debug("Tổng tiền hiện tại: {}", totalAmount);
        }

        // 4. Gán tổng tiền cuối cùng cho Order
        order.setTotalAmount(totalAmount);
        logger.info("Tổng tiền cuối cùng được tính toán: {}", totalAmount);

        // 5. Lưu Order (và OrderDetails nhờ CascadeType.ALL)
        logger.info("Đang cố gắng lưu đơn hàng vào CSDL...");
        Order savedOrder;
        try {
            savedOrder = orderRepository.save(order);
            logger.info("Đã lưu đơn hàng thành công với ID: {}", savedOrder.getId());
        } catch (Exception e) {
            logger.error("Lỗi khi lưu đơn hàng vào CSDL: {}", e.getMessage(), e);
            throw e;
        }

        // 6. Chuyển đổi entity đã lưu sang DTO và trả về
        return convertToDto(savedOrder);
    }

    /**
     * Lấy lịch sử đơn hàng của người dùng hiện tại.
     */
    @Transactional(readOnly = true)
    public List<OrderDto> getOrderHistoryForCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            logger.warn("Người dùng chưa đăng nhập cố gắng xem lịch sử đơn hàng.");
            return List.of();
        }
        String username = authentication.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));

        logger.info("Đang lấy lịch sử đơn hàng cho người dùng ID: {}", currentUser.getId());
        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(currentUser.getId());
        logger.info("Tìm thấy {} đơn hàng cho người dùng {}", orders.size(), username);

        return orders.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

@Transactional
    public OrderDto cancelOrder(Long orderId) {
        // 1. Lấy thông tin người dùng đang đăng nhập
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));
        
        logger.info("Người dùng ID: {} đang yêu cầu hủy đơn hàng ID: {}", currentUser.getId(), orderId);

        // 2. Tìm đơn hàng
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        // 3. Kiểm tra quyền sở hữu (Thêm kiểm tra null)
        if (order.getUser() == null || !order.getUser().getId().equals(currentUser.getId())) {
            logger.warn("Lỗi bảo mật: Người dùng ID: {} cố gắng hủy đơn hàng ID: {} không thuộc sở hữu.", currentUser.getId(), orderId);
            // Ném lỗi 403 Forbidden
            throw new org.springframework.security.access.AccessDeniedException("Bạn không có quyền hủy đơn hàng này.");
        }

        // 4. Kiểm tra trạng thái đơn hàng (Thêm kiểm tra null)
        // Đặt "PENDING" ở trước .equalsIgnoreCase để tránh NullPointerException nếu status là null
        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            logger.warn("Không thể hủy đơn hàng ID: {} vì trạng thái là {}", orderId, (order.getStatus() == null ? "NULL" : order.getStatus()));
            throw new IllegalStateException("Không thể hủy đơn hàng đã được xử lý hoặc đã hủy.");
        }

        // 5. Cập nhật trạng thái
        order.setStatus("CANCELLED"); // Đổi trạng thái thành "Đã hủy"
        Order savedOrder = orderRepository.save(order);
        logger.info("Đã hủy đơn hàng ID: {} thành công.", savedOrder.getId());

        // (Tùy chọn nâng cao: Hoàn lại tồn kho sản phẩm...)

        return convertToDto(savedOrder); // Trả về đơn hàng đã cập nhật
    }
@Transactional(readOnly = true)
    public List<OrderDto> getAllOrdersForAdmin() {
        logger.info("Admin đang lấy tất cả đơn hàng...");
        
        // Dùng hàm JOIN FETCH mới (Bạn phải thêm hàm này vào OrderRepository)
        List<Order> orders = orderRepository.findAllWithDetailsForAdmin();
        
        logger.info("Tìm thấy {} đơn hàng.", orders.size());
        
        // Dùng hàm convertToDto (giờ đã an toàn vì data đã được fetch)
        return orders.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * [ADMIN] Cập nhật trạng thái một đơn hàng.
     */
    @Transactional
    public OrderDto updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        logger.info("Admin đang cập nhật trạng thái cho đơn hàng ID: {} thành {}", orderId, request.getStatus());
        
        // 1. Kiểm tra trạng thái mới có hợp lệ không
        String newStatus = request.getStatus().toUpperCase();
        if (!List.of("PENDING", "SHIPPED", "DELIVERED", "CANCELLED").contains(newStatus)) {
             throw new IllegalArgumentException("Trạng thái không hợp lệ: " + request.getStatus());
        }

        // 2. Tìm đơn hàng
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        // 3. Cập nhật và lưu
        order.setStatus(newStatus);
        orderRepository.save(order);
        logger.info("Đã cập nhật trạng thái đơn hàng ID: {} thành công.", orderId);

        // 4. Lấy lại DTO đầy đủ (đã fetch) để trả về
        Order updatedOrder = orderRepository.findByIdWithDetails(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Lỗi không mong muốn khi lấy lại đơn hàng: " + orderId));

        return convertToDto(updatedOrder);
    }


    @Transactional
    public OrderDto updateOrderAddress(Long orderId, UpdateOrderAddressRequest request) {
        logger.info("Admin đang cập nhật địa chỉ cho đơn hàng ID: {}", orderId);

        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với ID: " + orderId));

        // [QUAN TRỌNG] Chỉ cho phép sửa địa chỉ khi đơn hàng chưa được xử lý
        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalStateException("Không thể cập nhật địa chỉ cho đơn hàng đã được xử lý (trạng thái: " + order.getStatus() + ").");
        }

        // Cập nhật địa chỉ (String)
        order.setShippingAddress(request.getShippingAddress());
        orderRepository.save(order);
        
        logger.info("Đã cập nhật địa chỉ đơn hàng ID: {} thành công.", orderId);

        // Trả về DTO đã cập nhật (dùng findByIdWithDetails để tránh N+1)
        Order updatedOrder = orderRepository.findByIdWithDetails(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Lỗi khi lấy lại đơn hàng: " + orderId));
            
        return convertToDto(updatedOrder);
    }


}