// src/main/java/com/doan2/nguyentuanthao_doan/exception/ResourceNotFoundException.java
package com.doan2.nguyenthuanthao_doan.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}