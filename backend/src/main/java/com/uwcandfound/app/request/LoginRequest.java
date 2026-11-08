package com.uwcandfound.app.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Student number is required")
    private String studentNumber;

    @NotBlank(message = "Password is required")
    private String password;
}
