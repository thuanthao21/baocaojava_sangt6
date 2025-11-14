// src/main/java/com/doan2/nguyenthuanthao_doan/service/AddressService.java
package com.doan2.nguyenthuanthao_doan.service;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.doan2.nguyenthuanthao_doan.dto.AddressDto;
import com.doan2.nguyenthuanthao_doan.entity.Address;
import com.doan2.nguyenthuanthao_doan.entity.User;
import com.doan2.nguyenthuanthao_doan.exception.ResourceNotFoundException;
import com.doan2.nguyenthuanthao_doan.repository.AddressRepository;
import com.doan2.nguyenthuanthao_doan.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AddressService {

    private static final Logger logger = LoggerFactory.getLogger(AddressService.class);

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    // --- Lấy User hiện tại (Hàm helper) ---
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new IllegalStateException("User must be authenticated to manage addresses.");
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    // --- Hàm Helper: Chuyển Address Entity sang AddressDto ---
    private AddressDto convertToDto(Address address) {
        AddressDto dto = new AddressDto();
        dto.setId(address.getId());
        dto.setStreet(address.getStreet());
        dto.setCity(address.getCity());
        dto.setPhoneNumber(address.getPhoneNumber());
        dto.setDefault(address.isDefault());
        return dto;
    }

    // --- Lấy tất cả địa chỉ của người dùng hiện tại ---
    @Transactional(readOnly = true)
    public List<AddressDto> getMyAddresses() {
        User currentUser = getCurrentUser();
        logger.info("Fetching addresses for user ID: {}", currentUser.getId());
        List<Address> addresses = addressRepository.findByUserId(currentUser.getId());
        logger.info("Found {} addresses for user {}", addresses.size(), currentUser.getUsername());
        return addresses.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // --- [GEMINI_VN]: Thêm địa chỉ mới (LOGIC DEFAULT ĐÃ SỬA THEO CÁCH 2) ---
    @Transactional
    public AddressDto addAddress(AddressDto addressDto) {
        User currentUser = getCurrentUser();
        logger.info("User ID {} attempting to add a new address.", currentUser.getId());

        Address address = new Address();
        address.setUser(currentUser);
        address.setStreet(addressDto.getStreet());
        address.setCity(addressDto.getCity());
        address.setPhoneNumber(addressDto.getPhoneNumber());
        address.setDefault(addressDto.isDefault());

        // [GEMINI_VN]: Logic xử lý địa chỉ mặc định MỚI:
        if (address.isDefault()) {
            // Tìm địa chỉ default hiện tại (nếu có) và bỏ cờ default của nó đi
            addressRepository.findByUserIdAndIsDefaultTrue(currentUser.getId())
                .ifPresent(currentDefault -> {
                    logger.info("Removing default status from previous default address ID: {}", currentDefault.getId());
                    currentDefault.setDefault(false);
                    addressRepository.save(currentDefault); // Lưu lại địa chỉ cũ đã bỏ default
                });
        }

        // Lưu địa chỉ mới (có thể là default hoặc không)
        Address savedAddress = addressRepository.save(address);
        logger.info("Address added successfully with ID: {} for user ID {}.", savedAddress.getId(), currentUser.getId());
        return convertToDto(savedAddress);
    }

    // --- [GEMINI_VN]: Cập nhật địa chỉ (LOGIC DEFAULT ĐÃ SỬA THEO CÁCH 2) ---
    @Transactional
    public AddressDto updateAddress(Long addressId, AddressDto addressDto) {
        User currentUser = getCurrentUser();
        logger.info("User ID {} attempting to update address ID {}.", currentUser.getId(), addressId);

        Address addressToUpdate = addressRepository.findByIdAndUserId(addressId, currentUser.getId())
                .orElseThrow(() -> {
                     logger.error("Address with ID {} not found or does not belong to user ID {}.", addressId, currentUser.getId());
                     return new ResourceNotFoundException("Address not found with id: " + addressId + " for current user");
                });

        // Cập nhật thông tin từ DTO
        addressToUpdate.setStreet(addressDto.getStreet());
        addressToUpdate.setCity(addressDto.getCity());
        addressToUpdate.setPhoneNumber(addressDto.getPhoneNumber());
        boolean intendedToBeDefault = addressDto.isDefault(); // Lưu lại ý định người dùng muốn set default hay không

        // [GEMINI_VN]: Logic xử lý địa chỉ mặc định MỚI:
        if (intendedToBeDefault) {
             // Nếu địa chỉ này được yêu cầu set là default
            if (!addressToUpdate.isDefault()) { // Và nó chưa phải là default trước đó
                 // Tìm địa chỉ default hiện tại (nếu có và khác địa chỉ này) và bỏ cờ default của nó đi
                 addressRepository.findByUserIdAndIsDefaultTrue(currentUser.getId())
                    .filter(currentDefault -> !currentDefault.getId().equals(addressId)) // Chỉ xử lý nếu nó KHÁC địa chỉ đang sửa
                    .ifPresent(currentDefault -> {
                        logger.info("Removing default status from previous default address ID: {}", currentDefault.getId());
                        currentDefault.setDefault(false);
                        addressRepository.save(currentDefault); // Lưu lại địa chỉ cũ đã bỏ default
                    });
                addressToUpdate.setDefault(true); // Set địa chỉ này thành default
            }
            // Nếu nó đã là default rồi thì không cần làm gì thêm (vì đã tìm và bỏ default cái cũ nếu có)
        } else {
             // Nếu địa chỉ này được yêu cầu bỏ cờ default
             addressToUpdate.setDefault(false);
             // Không cần tìm địa chỉ khác để set default, người dùng có thể không có địa chỉ default nào cả
        }

        // Lưu lại địa chỉ đã cập nhật
        Address updatedAddress = addressRepository.save(addressToUpdate);
        logger.info("Address ID {} updated successfully for user ID {}.", addressId, currentUser.getId());
        return convertToDto(updatedAddress);
    }

    // --- Xóa địa chỉ ---
    @Transactional
    public void deleteAddress(Long addressId) {
        User currentUser = getCurrentUser();
        logger.info("User ID {} attempting to delete address ID {}.", currentUser.getId(), addressId);

        Address address = addressRepository.findByIdAndUserId(addressId, currentUser.getId())
                .orElseThrow(() -> {
                     logger.error("Address with ID {} not found or does not belong to user ID {}.", addressId, currentUser.getId());
                     return new ResourceNotFoundException("Address not found with id: " + addressId + " for current user");
                });

        // [GEMINI_VN]: Thêm logic xử lý nếu xóa địa chỉ default (tùy chọn)
        // Ví dụ: Tìm 1 địa chỉ khác để set default, hoặc báo lỗi không cho xóa default.
        // Hiện tại code này cho phép xóa địa chỉ default.
        if (address.isDefault()) {
            logger.warn("Deleting the default address ID {} for user ID {}", addressId, currentUser.getId());
            // Có thể thêm logic tìm địa chỉ khác để set default ở đây nếu muốn
        }

        addressRepository.delete(address);
        logger.info("Address ID {} deleted successfully for user ID {}.", addressId, currentUser.getId());
    }
}