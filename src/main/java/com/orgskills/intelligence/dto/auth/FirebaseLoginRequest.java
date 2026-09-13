package com.orgskills.intelligence.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FirebaseLoginRequest {

    @NotBlank(message = "Firebase ID token is required")
    private String idToken;
}
