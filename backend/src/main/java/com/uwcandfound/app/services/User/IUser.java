package com.uwcandfound.app.services.User;

import com.uwcandfound.app.models.User;
import com.uwcandfound.app.request.*;

public interface IUser {
//    a user can create an account, update their information and delete/deactivate their account
    UserResponse createUser(UserRequest user);
    UserResponse updateUser(UserRequest user, Long id);
    void deleteUser(Long id);
}
