// src/main/java/com/doan2/nguyenthuanthao_doan/controller/AddressController.java
package com.doan2.nguyenthuanthao_doan.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping; // Import thêm PutMapping, DeleteMapping, PathVariable
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.doan2.nguyenthuanthao_doan.dto.AddressDto;
import com.doan2.nguyenthuanthao_doan.service.AddressService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/addresses") // Base path cho Addresses
@RequiredArgsConstructor
public class AddressController {

    private static final Logger logger = LoggerFactory.getLogger(AddressController.class);
    private final AddressService addressService;

    // --- API Lấy tất cả địa chỉ của người dùng hiện tại ---
    @GetMapping
    public ResponseEntity<List<AddressDto>> getMyAddresses() {
        logger.info(">>> Received request to get current user's addresses.");
        List<AddressDto> addresses = addressService.getMyAddresses();
        logger.info("<<< Returning {} addresses.", addresses.size());
        return ResponseEntity.ok(addresses);
    }

    // --- API Thêm địa chỉ mới ---
    @PostMapping
    public ResponseEntity<AddressDto> addAddress(@Valid @RequestBody AddressDto addressDto) {
        logger.info(">>> Received request to add new address: {}", addressDto);
        AddressDto savedAddress = addressService.addAddress(addressDto);
        logger.info("<<< Address added successfully with ID: {}", savedAddress.getId());
        return ResponseEntity.ok(savedAddress); // Trả về 200 OK với địa chỉ đã tạo
    }

    // --- API Cập nhật địa chỉ ---
    @PutMapping("/{addressId}")
    public ResponseEntity<AddressDto> updateAddress(
            @PathVariable Long addressId,
            @Valid @RequestBody AddressDto addressDto) {
        logger.info(">>> Received request to update address ID {}: {}", addressId, addressDto);
        AddressDto updatedAddress = addressService.updateAddress(addressId, addressDto);
        logger.info("<<< Address ID {} updated successfully.", addressId);
        return ResponseEntity.ok(updatedAddress);
    }

    // --- API Xóa địa chỉ ---
    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long addressId) {
        logger.info(">>> Received request to delete address ID {}.", addressId);
        addressService.deleteAddress(addressId);
        logger.info("<<< Address ID {} deleted successfully.", addressId);
        return ResponseEntity.noContent().build(); // Trả về 204 No Content
    }
}