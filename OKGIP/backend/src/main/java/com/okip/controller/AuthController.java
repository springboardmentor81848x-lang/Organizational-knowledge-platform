package com.okip.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.okip.dto.auth.GoogleLoginRequestDTO;
import com.okip.dto.auth.LoginRequestDTO;
import com.okip.dto.auth.LoginResponseDTO;
import com.okip.dto.auth.RegisterRequestDTO;
import com.okip.dto.auth.RegisterResponseDTO;
import com.okip.service.auth.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDTO> registerEmployee(
            @RequestBody RegisterRequestDTO request) {

        RegisterResponseDTO response =
                authService.registerEmployee(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> loginEmployee(
            @RequestBody LoginRequestDTO request) {

        LoginResponseDTO response =
                authService.loginEmployee(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
    public ResponseEntity<LoginResponseDTO> googleLogin(
            @RequestBody GoogleLoginRequestDTO request) {

        LoginResponseDTO response =
                authService.googleLogin(request.getIdToken());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/microsoft")
public ResponseEntity<LoginResponseDTO> microsoftLogin(
        @RequestBody GoogleLoginRequestDTO request) {

    LoginResponseDTO response =
            authService.microsoftLogin(request.getIdToken());

    return ResponseEntity.ok(response);
}
}