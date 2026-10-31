package com.uwcandfound.app.controller;

import com.uwcandfound.app.exceptions.ResourceNotFoundException;
import com.uwcandfound.app.models.User;
import com.uwcandfound.app.repositories.UserRepository;
import com.uwcandfound.app.request.AuthResponse;
import com.uwcandfound.app.request.LoginRequest;
import com.uwcandfound.app.security.JwtUtils;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/auth")
@AllArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
//        step 1. get the user's email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));

        if (!user.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Account is deactivated");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

        String token = jwtUtils.generateToken(user.getEmail(), String.valueOf(user.getRole()));
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
