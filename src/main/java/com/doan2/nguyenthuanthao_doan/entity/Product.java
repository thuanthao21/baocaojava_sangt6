package com.doan2.nguyenthuanthao_doan.entity;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set; // Import

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;       // Import
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(nullable = false)
    private BigDecimal price;
    private String imageUrl;

@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    // @JsonIgnore // <-- BỎ QUA DÒNG NÀY (Vì chúng ta cần xem category trong Product)
    private Category category;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore // <-- THÊM VÀO ĐÂY (Ngăn 'reviews' gây đệ quy)
    private Set<Review> reviews = new HashSet<>();

    @ManyToMany(mappedBy = "wishlist", fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore // <-- THÊM VÀO ĐÂY (Ngăn 'users' gây đệ quy)
    private Set<User> wishedByUsers = new HashSet<>();

   @Column(nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer quantity = 0; 
}