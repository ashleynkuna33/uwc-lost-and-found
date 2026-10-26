package com.uwcandfound.app.request;

import com.uwcandfound.app.models.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest {
    private String studentNumber;
    private String name;
    private String lastname;
    private String email;
    private String password;
    private String phoneNumber;
    private User.Role role;
    private Boolean isActive;
}