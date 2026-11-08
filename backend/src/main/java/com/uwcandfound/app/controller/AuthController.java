package com.uwcandfound.app.controller;


import com.uwcandfound.app.exceptions.ResourceNotFoundException;
import com.uwcandfound.app.models.User;
import com.uwcandfound.app.repositories.UserRepository;
import com.uwcandfound.app.request.*;
import com.uwcandfound.app.security.JwtUtils;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.uwcandfound.app.exceptions.ResourceNotFoundException;
import com.uwcandfound.app.models.User;
import com.uwcandfound.app.repositories.UserRepository;
import com.uwcandfound.app.security.JwtUtils;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

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
        User user = userRepository.findByStudentNumber(request.getStudentNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));

        if (!user.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Account is deactivated");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

        String token = jwtUtils.generateToken(user.getEmail(), String.valueOf(user.getRole()));
        return ResponseEntity.ok(new AuthResponse(token, user.getStudentNumber(), user.getRole()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegistrationRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already in use");
        }

        User user = new User();

        user.setStudentNumber(request.getStudentNumber());
        user.setName(request.getName());
        user.setLastname(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);

        return ResponseEntity.ok().body("Account registered successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        String email = authentication.getName();

        User user = userRepository.findByEmail((email))
                .orElseThrow(() -> new ResourceNotFoundException("Session is not valid"));

        if (!user.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Account is deactivated");
        }

        return ResponseEntity.ok(new AuthResponse( user.getStudentNumber(), user.getRole()));
    }
}
