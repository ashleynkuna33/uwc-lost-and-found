package com.uwcandfound.app.services.User;

import com.uwcandfound.app.models.User;
import com.uwcandfound.app.request.*;

public interface IUser {
//    a user can create an account, update their information, delete/deactivate and activate account their account
    UserResponse createUser(UserRequest user);
    UserResponse updateUser(UserRequest user, Long id);
    UserResponse activateUser(String email);
    void deactivateUser(Long id);
}
