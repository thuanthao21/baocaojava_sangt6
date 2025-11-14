// src/main/java/com/doan2/nguyenthuanthao_doan/repository/AddressRepository.java
package com.doan2.nguyenthuanthao_doan.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository; // Cần thiết
import org.springframework.data.jpa.repository.Modifying;   // Cần thiết
import org.springframework.data.jpa.repository.Query; // Cần thiết
import org.springframework.data.repository.query.Param;

import com.doan2.nguyenthuanthao_doan.entity.Address;

public interface AddressRepository extends JpaRepository<Address, Long> {

    // Tìm tất cả địa chỉ của một user
    List<Address> findByUserId(Long userId);

    // Tìm một địa chỉ cụ thể của một user (để kiểm tra quyền sở hữu khi sửa/xóa)
    Optional<Address> findByIdAndUserId(Long id, Long userId);

    // Xóa cờ 'default' của tất cả địa chỉ KHÁC của user này
    // Dòng này không cần nữa trong Cách 2, nhưng để lại cũng không sao
    @Modifying
    @Query("UPDATE Address a SET a.isDefault = false WHERE a.user.id = :userId AND a.isDefault = true")
    void clearDefaultForUser(@Param("userId") Long userId);

    // [GEMINI_VN]: HÀM MỚI THEO CÁCH 2 - Tìm địa chỉ đang là default của user (nếu có)
    Optional<Address> findByUserIdAndIsDefaultTrue(Long userId);
}