package com.okip.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.okip.dto.profile.EmployeeProfileRequestDTO;
import com.okip.dto.profile.EmployeeProfileResponseDTO;
import com.okip.service.profile.ProfileService;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @PostMapping
    public ResponseEntity<EmployeeProfileResponseDTO> createProfile(
            @RequestBody EmployeeProfileRequestDTO request) {

        EmployeeProfileResponseDTO response =
                profileService.createProfile(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<EmployeeProfileResponseDTO> getMyProfile() {

        return ResponseEntity.ok(
                profileService.getMyProfile());
    }

    @PutMapping
    public ResponseEntity<EmployeeProfileResponseDTO> updateProfile(
            @RequestBody EmployeeProfileRequestDTO request) {

        return ResponseEntity.ok(
                profileService.updateProfile(request));
    }
}