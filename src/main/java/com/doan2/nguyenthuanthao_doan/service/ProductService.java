package com.doan2.nguyenthuanthao_doan.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.doan2.nguyenthuanthao_doan.dto.ProductDto;
import com.doan2.nguyenthuanthao_doan.dto.ProductRequest;
import com.doan2.nguyenthuanthao_doan.entity.Category;
import com.doan2.nguyenthuanthao_doan.entity.Product;
import com.doan2.nguyenthuanthao_doan.exception.ResourceNotFoundException;
import com.doan2.nguyenthuanthao_doan.repository.CategoryRepository;
import com.doan2.nguyenthuanthao_doan.repository.ProductRepository; 

import jakarta.persistence.criteria.Predicate; 
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // Sử dụng constructor injection
public class ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    // --- API CÔNG KHAI (Lấy sản phẩm cho người dùng) ---
    @Transactional(readOnly = true)
    public Page<ProductDto> getAllProducts(
            String search, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice,
            int page, int size, String sortBy, String sortOrder) {

        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Product> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isEmpty()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchPattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), searchPattern)
                ));
            }

            if (categoryId != null) {
                List<Long> categoryIdsToFilter = new ArrayList<>();
                categoryIdsToFilter.add(categoryId);
                categoryRepository.findById(categoryId).ifPresent(parentCategory -> {
                    if (parentCategory.getChildren() != null && !parentCategory.getChildren().isEmpty()) {
                        Set<Long> childIds = parentCategory.getChildren().stream()
                                .map(Category::getId)
                                .collect(Collectors.toSet());
                        categoryIdsToFilter.addAll(childIds);
                        logger.info("Filtering products for category {} and its {} children.", 
                                     parentCategory.getName(), childIds.size());
                    }
                });
                predicates.add(root.get("category").get("id").in(categoryIdsToFilter));
            }

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> productPage = productRepository.findAll(spec, pageable);
        return productPage.map(this::convertToDto);
    }
    
    // --- API CÔNG KHAI (Lấy chi tiết 1 sản phẩm) ---
    @Transactional(readOnly = true)
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return convertToDto(product);
    }

// --- HÀM HỖ TRỢ (Chuyển Entity sang DTO) ---
 public ProductDto convertToDto(Product product) {
 ProductDto dto = new ProductDto();
 dto.setId(product.getId());
 dto.setName(product.getName());
 dto.setDescription(product.getDescription());
 dto.setPrice(product.getPrice());
dto.setImageUrl(product.getImageUrl());
 dto.setQuantity(product.getQuantity()); 
 if (product.getCategory() != null) {
dto.setCategoryName(product.getCategory().getName());
}
 return dto;
 }


 /** [HÀM MỚI] Xây dựng Specification cho Admin (Chỉ tìm kiếm theo Tên/Mô tả và ID danh mục) */
    public static Specification<Product> filterProductsForAdmin(
        String search, 
        Long categoryId) {
        
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Lọc theo tìm kiếm chung (Tên hoặc Mô tả)
            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchPattern);
                Predicate descriptionMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), searchPattern);
                predicates.add(criteriaBuilder.or(nameMatch, descriptionMatch));
            }

            // 2. Lọc theo Danh mục (Category ID)
            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), categoryId));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
    
    // --- CÁC HÀM MỚI CHO ADMIN ---

/** [Admin] Lấy tất cả sản phẩm (KHÔNG phân trang, CÓ tìm kiếm, lọc) */
@Transactional(readOnly = true)
public List<ProductDto> getAllProductsForAdmin(
        String search, 
        Long categoryId,
        // Chỉ giữ lại tham số sắp xếp nếu cần thiết
        String sortBy, 
        String sortOrder) { 
    
    // 1. Xây dựng Specification (điều kiện lọc/tìm kiếm)
    Specification<Product> spec = filterProductsForAdmin(search, categoryId);

    // 2. Xây dựng Sort (đảm bảo sắp xếp luôn được áp dụng)
    Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), sortBy);
    
    // 3. Gọi hàm findAll của JpaSpecificationExecutor (trả về List)
    List<Product> productList = productRepository.findAll(spec, sort);
    
    // 4. Chuyển List<Entity> sang List<DTO>
    return productList.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
}
    
    /** [Admin] POST: Tạo sản phẩm mới */
    @Transactional
public ProductDto createProduct(ProductRequest request) { 
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        product.setQuantity(request.getQuantity());
        product.setCategory(category);
        
        // [SỬA 2] Lưu vào CSDL, sau đó convert sang DTO
        Product savedProduct = productRepository.save(product);
        return convertToDto(savedProduct); // Trả về DTO
    }
    /** [Admin] PUT: Cập nhật sản phẩm */
    @Transactional
public ProductDto updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        product.setQuantity(request.getQuantity());
        product.setCategory(category);
        
        // [SỬA 4] Lưu vào CSDL, sau đó convert sang DTO
        Product updatedProduct = productRepository.save(product);
        return convertToDto(updatedProduct); // Trả về DTO
    }
    /** [Admin] DELETE: Xóa sản phẩm */
    @Transactional
public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }
}