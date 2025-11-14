// src/main/java/com/doan2/nguyenthuanthao_doan/config/security/JwtAuthenticationFilter.java
package com.doan2.nguyenthuanthao_doan.config.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder; // Import đúng
import org.springframework.security.core.userdetails.UserDetails; // Import đúng
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class); // Đã có

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // Log URI của request đến
        logger.info(">>> Request URI: {}", request.getRequestURI()); // Đã có

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // MỚI: Thêm log cho trường hợp không có header
            logger.warn(">>> No valid Authorization header found, passing request through.");
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        
        // MỚI: Thêm try-catch để bắt lỗi giải mã token (rất quan trọng)
        try {
            username = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            logger.error("!!! Error extracting username from token: {}", e.getMessage());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid Token: " + e.getMessage());
            return; // Dừng lại nếu token lỗi
        }

        // Kiểm tra xem đã có ai đăng nhập chưa
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            logger.info(">>> Username '{}' extracted. SecurityContext is null, proceeding with validation.", username);

            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            if (jwtService.isTokenValid(jwt, userDetails)) {
                // MỚI: Log khi token hợp lệ
                logger.info(">>> Token is VALID for user '{}'. Setting Authentication in SecurityContext.", username);

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);

                // MỚI: Log để xác nhận đã set Authentication
                logger.info(">>> Authentication SET for user '{}' with authorities: {}",
                        SecurityContextHolder.getContext().getAuthentication().getName(),
                        SecurityContextHolder.getContext().getAuthentication().getAuthorities());

            } else {
                // MỚI: Log khi token không hợp lệ
                logger.warn("!!! Token is INVALID for user '{}'.", username);
            }
        } else {
            // MỚI: Log lý do tại sao không xử lý
            if (username == null) {
                logger.warn(">>> Username extraction failed or username is null.");
            } else {
                logger.info(">>> SecurityContext already contains Authentication for '{}', skipping filter.", username);
            }
        }

        // Luôn gọi filter tiếp theo
        filterChain.doFilter(request, response);
        logger.info("<<< Finished processing request URI: {}", request.getRequestURI());
    }
}