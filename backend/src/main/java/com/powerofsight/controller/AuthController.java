package com.powerofsight.controller;

import com.powerofsight.dto.LoginRequest;
import com.powerofsight.dto.RegisterRequest;
import com.powerofsight.dto.UserResponse;
import com.powerofsight.entity.User;
import com.powerofsight.security.CurrentUser;
import com.powerofsight.security.JwtService;
import com.powerofsight.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.register(request);
        return withLoginCookie(HttpStatus.CREATED, user);
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = authService.login(request);
        return withLoginCookie(HttpStatus.OK, user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, jwtService.logoutCookie().toString())
                .build();
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal Jwt jwt) {
        return UserResponse.from(authService.get(CurrentUser.id(jwt)));
    }

    private ResponseEntity<UserResponse> withLoginCookie(HttpStatus status, User user) {
        return ResponseEntity.status(status)
                .header(HttpHeaders.SET_COOKIE, jwtService.loginCookie(user).toString())
                .body(UserResponse.from(user));
    }
}
