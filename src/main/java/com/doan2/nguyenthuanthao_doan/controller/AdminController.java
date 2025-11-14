    // src/main/java/com/doan2/nguyenthuanthao_doan/controller/AdminController.java
    package com.doan2.nguyenthuanthao_doan.controller;

    // [GEMINI_VN]: Import các DTO
    import java.util.List;

    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.security.access.prepost.PreAuthorize;
    import org.springframework.web.bind.annotation.DeleteMapping;
    import org.springframework.web.bind.annotation.GetMapping;
    import org.springframework.web.bind.annotation.PathVariable;
    import org.springframework.web.bind.annotation.PostMapping;
    import org.springframework.web.bind.annotation.PutMapping;
    import org.springframework.web.bind.annotation.RequestBody;
    import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

    import com.doan2.nguyenthuanthao_doan.dto.CategoryDto;
    import com.doan2.nguyenthuanthao_doan.dto.OrderDto;
    import com.doan2.nguyenthuanthao_doan.dto.ProductDto;
    import com.doan2.nguyenthuanthao_doan.dto.ProductRequest;
import com.doan2.nguyenthuanthao_doan.dto.UpdateOrderAddressRequest;
import com.doan2.nguyenthuanthao_doan.dto.UpdateOrderStatusRequest;
    import com.doan2.nguyenthuanthao_doan.service.CategoryService;
    import com.doan2.nguyenthuanthao_doan.service.OrderService;
    import com.doan2.nguyenthuanthao_doan.service.ProductService;

    import jakarta.validation.Valid;
    import lombok.RequiredArgsConstructor;

    @RestController
    @RequestMapping("/api/admin") // BASE URL: /api/admin
    @RequiredArgsConstructor
    @PreAuthorize("hasRole('ADMIN')") // Bảo vệ toàn bộ Controller
    public class AdminController {

        private final ProductService productService;
        private final CategoryService categoryService;
        private final OrderService orderService;

        // --- API QUẢN LÝ SẢN PHẨM ---
        
@GetMapping("/products")
public ResponseEntity<List<ProductDto>> getAllProductsForAdmin(
        // [SỬA] Đổi kiểu trả về sang List
        @RequestParam(defaultValue = "id") String sortBy,
        @RequestParam(defaultValue = "DESC") String sortOrder,
        @RequestParam(required = false) String search, 
        @RequestParam(required = false) Long categoryId) { 
            
    // [SỬA] Gọi hàm Service mới
    List<ProductDto> products = productService.getAllProductsForAdmin(
        search, categoryId, sortBy, sortOrder); 
        
    return ResponseEntity.ok(products);
}
    @PostMapping("/products")
        // [SỬA 1] Đổi kiểu trả về ResponseEntity<Product> -> ResponseEntity<ProductDto>
        public ResponseEntity<ProductDto> createProduct(@Valid @RequestBody ProductRequest request) {
            
            // [SỬA 2] Service giờ đã trả về DTO
            ProductDto newProductDto = productService.createProduct(request); 
            
            // [SỬA 3] Trả về 201 Created (Best practice)
            return new ResponseEntity<>(newProductDto, HttpStatus.CREATED);
        }

        @PutMapping("/products/{id}")
        // [SỬA 1] Đổi kiểu trả về ResponseEntity<Product> -> ResponseEntity<ProductDto>
        public ResponseEntity<ProductDto> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
            
            // [SỬA 2] Service giờ đã trả về DTO
            ProductDto updatedProductDto = productService.updateProduct(id, request);
            
            return ResponseEntity.ok(updatedProductDto);
        }
        @DeleteMapping("/products/{id}")
        public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
            productService.deleteProduct(id);
            return ResponseEntity.noContent().build();
        }
        
        // --- API QUẢN LÝ DANH MỤC ---
        
        @GetMapping("/categories")
        public ResponseEntity<List<CategoryDto>> getAllCategories() { // SỬA Ở ĐÂY
            // Service đã trả về List<CategoryDto> (dạng phẳng)
            return ResponseEntity.ok(categoryService.getAllCategories());
        }
        
    @PostMapping("/categories")
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CategoryDto categoryDto) {
        CategoryDto createdDto = categoryService.createCategory(categoryDto);
        // SỬA Ở ĐÂY
        return new ResponseEntity<>(createdDto, HttpStatus.CREATED); 
    }
        
        @PutMapping("/categories/{id}")
        public ResponseEntity<CategoryDto> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryDto categoryDto) {
            return ResponseEntity.ok(categoryService.updateCategory(id, categoryDto));
        }
        
        @DeleteMapping("/categories/{id}")
        public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
            categoryService.deleteCategory(id);
            return ResponseEntity.noContent().build();
        }

        // --- [MỚI] API QUẢN LÝ ĐƠN HÀNG ---

        /**
         * [ADMIN] Lấy tất cả đơn hàng (đã sửa N+1)
         */
        @GetMapping("/orders")
        public ResponseEntity<List<OrderDto>> getAllOrders() {
            List<OrderDto> orders = orderService.getAllOrdersForAdmin();
            return ResponseEntity.ok(orders);
        }

        /**
         * [ADMIN] Cập nhật trạng thái đơn hàng
         * (Dùng PUT hoặc PATCH đều được. PUT hợp lý hơn nếu ta chỉ cập nhật status)
         */
        @PutMapping("/orders/{id}/status")
        public ResponseEntity<OrderDto> updateOrderStatus(
                @PathVariable Long id,
                @Valid @RequestBody UpdateOrderStatusRequest request) {
                    
            OrderDto updatedOrder = orderService.updateOrderStatus(id, request);
            return ResponseEntity.ok(updatedOrder);
        }

        @PutMapping("/orders/{id}/address")
    public ResponseEntity<OrderDto> updateOrderAddress( 
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderAddressRequest request) {
                
        OrderDto updatedOrder = orderService.updateOrderAddress(id, request);
        return ResponseEntity.ok(updatedOrder);
    }
    }