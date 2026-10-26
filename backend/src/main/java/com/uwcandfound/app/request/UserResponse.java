package com.uwcandfound.app.request;

import com.uwcandfound.app.models.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserResponse {
    private String studentNumber;
    private String name;
    private String lastname;
    private User.Role role;
}
