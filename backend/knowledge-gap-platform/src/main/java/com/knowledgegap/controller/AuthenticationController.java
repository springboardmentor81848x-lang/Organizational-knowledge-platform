// // package com.knowledgegap.controller;

// // import com.knowledgegap.dto.AuthResponse;
// // import com.knowledgegap.dto.LoginRequest;
// // import com.knowledgegap.service.AuthenticationService;
// // import org.springframework.http.ResponseEntity;
// // import org.springframework.web.bind.annotation.*;

// // @RestController
// // @RequestMapping("/api/auth")
// // public class AuthenticationController {

// //     private final AuthenticationService authenticationService;

// //     public AuthenticationController(AuthenticationService authenticationService) {
// //         this.authenticationService = authenticationService;
// //     }

// //     @PostMapping("/login")
// //     public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {

// //         return ResponseEntity.ok(authenticationService.login(request));
// //     }
// // }

// package com.knowledgegap.controller;

// import com.knowledgegap.dto.AuthResponse;
// import com.knowledgegap.dto.LoginRequest;
// import com.knowledgegap.dto.SignupRequest;
// import com.knowledgegap.service.AuthenticationService;

// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/api/auth")
// @CrossOrigin(origins = "http://localhost:5173")
// public class AuthenticationController {

//     private final AuthenticationService authenticationService;

//     public AuthenticationController(AuthenticationService authenticationService) {
//         this.authenticationService = authenticationService;
//     }


//     // LOGIN
//     @PostMapping("/login")
//     public ResponseEntity<AuthResponse> login(
//             @RequestBody LoginRequest request) {

//         return ResponseEntity.ok(
//                 authenticationService.login(request)
//         );
//     }


//     // SIGNUP
//     @PostMapping("/signup")
//     public ResponseEntity<AuthResponse> signup(
//             @RequestBody SignupRequest request) {

//         return ResponseEntity.ok(
//                 authenticationService.signup(request)
//         );
//     }
// }

package com.knowledgegap.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowledgegap.dto.AuthResponse;
import com.knowledgegap.dto.LoginRequest;
import com.knowledgegap.dto.SignupRequest;
import com.knowledgegap.service.AuthenticationService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {

        return ResponseEntity.ok(authenticationService.login(request));
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {

        return ResponseEntity.ok(authenticationService.signup(request));
    }
}