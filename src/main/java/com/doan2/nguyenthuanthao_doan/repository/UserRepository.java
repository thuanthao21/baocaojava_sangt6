package com.doan2.nguyenthuanthao_doan.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.doan2.nguyenthuanthao_doan.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
}