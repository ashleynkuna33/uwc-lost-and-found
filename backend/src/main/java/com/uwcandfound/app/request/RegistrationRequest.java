package com.uwcandfound.app.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegistrationRequest {

    @NotBlank(message = "student number is required")
    private String studentNumber;

    @NotBlank(message = "firstname is required")
    private String name;

    @NotBlank(message = "lastname is required")
    private String lastName;

    @NotBlank(message = "email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "password is required")
    private String password;

    private String phone;

}