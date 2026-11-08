package com.uwcandfound.app.request;

import com.uwcandfound.app.models.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";

    private String studentNumber;
    private User.Role role;

    public AuthResponse(String token, String studentNumber, User.Role role) {
        this.token = token;
        this.studentNumber = studentNumber;
        this.role = role;
    }

    public AuthResponse(String studentNumber, User.Role role) {
        this.studentNumber = studentNumber;
        this.role = role;
    }


}
