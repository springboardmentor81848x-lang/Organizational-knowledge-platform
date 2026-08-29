package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.auth.AuthResponse;
import com.orgskills.intelligence.dto.auth.ChangePasswordRequest;
import com.orgskills.intelligence.dto.auth.LoginRequest;
import com.orgskills.intelligence.dto.auth.RegisterRequest;
import com.orgskills.intelligence.dto.auth.UpdateProfileRequest;
import com.orgskills.intelligence.dto.auth.UserProfileResponse;
import com.orgskills.intelligence.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody com.orgskills.intelligence.dto.auth.RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/oauth2/google")
    public ResponseEntity<AuthResponse> oauth2Google(@Valid @RequestBody com.orgskills.intelligence.dto.auth.OAuth2GoogleRequest request) {
        return ResponseEntity.ok(authService.oauth2GoogleLogin(request));
    }

    /**
     * Always answers 202, whether or not the address has an account. Anything else would let a
     * caller discover who works here.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(
            @Valid @RequestBody com.orgskills.intelligence.dto.auth.ForgotPasswordRequest request) {
        authService.requestPasswordReset(request);
        return ResponseEntity.accepted().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(Authentication authentication) {
        return ResponseEntity.ok(authService.getCurrentUser(authentication));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(Authentication authentication,
                                                              @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(authentication, request));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(Authentication authentication,
                                                @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(authentication, request);
        return ResponseEntity.noContent().build();
    }
}
