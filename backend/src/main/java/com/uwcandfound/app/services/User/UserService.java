package com.uwcandfound.app.services.User;

import com.uwcandfound.app.exceptions.DuplicateResourceException;
import com.uwcandfound.app.exceptions.ResourceNotFoundException;
import com.uwcandfound.app.request.*;
import com.uwcandfound.app.models.User;
import com.uwcandfound.app.repositories.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;


@Service
@AllArgsConstructor
public class UserService implements IUser {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
//            confirm if student information is new on the system
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }
        if (userRepository.existsByStudentNumber(request.getStudentNumber())) {
            throw new DuplicateResourceException("Student number already registered: " + request.getStudentNumber());
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new DuplicateResourceException("Phone number already registered: " + request.getPhoneNumber());
        }

//            create user, store data and save
        User newUser = createUserHelper(request);
        User savedUser = userRepository.save(newUser);

//            create response data
        return new UserResponse(
                savedUser.getStudentNumber(),
                savedUser.getName(),
                savedUser.getLastname(),
                savedUser.getRole()
        );
    }
    private User createUserHelper(UserRequest request) {

        User newUser = new User();

        newUser.setStudentNumber(request.getStudentNumber());
        newUser.setName(request.getName());
        newUser.setLastname(request.getLastname());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(request.getPassword());
        newUser.setPhoneNumber(request.getPhoneNumber());

        return newUser;
    }

    @Override
    @Transactional
    public UserResponse updateUser(UserRequest request, Long id) {
//        confirm if the user exist and fetch all data
        User savedUser = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        User updatedUser  = updateUserHelper(savedUser, request);
        User saved = userRepository.save(updatedUser);

        return new UserResponse(
                saved.getStudentNumber(),
                saved.getName(),
                saved.getLastname(),
                saved.getRole()
        );
    }
    private User updateUserHelper(User oldUser, UserRequest request) {

        if (request.getName() != null && !request.getName().isBlank()) {
            if (!request.getName().equals(oldUser.getName())) {
                oldUser.setName(request.getName());
            }
        }

        if (request.getLastname() != null && !request.getLastname().isBlank()) {
            if (!request.getLastname().equals(oldUser.getLastname())) {
                oldUser.setLastname(request.getLastname());
            }
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!request.getEmail().equals(oldUser.getEmail())) {
                if (userRepository.existsByEmail(request.getEmail())) {
                    throw new DuplicateResourceException("Email already taken: " + request.getEmail());
                }
                oldUser.setEmail(request.getEmail());
            }
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            if (!request.getPhoneNumber().equals(oldUser.getPhoneNumber())) {
                if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                    throw new DuplicateResourceException("Phone number already registered: " + request.getPhoneNumber());
                }
                oldUser.setPhoneNumber(request.getPhoneNumber());
            }
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            if (!request.getPassword().equals(oldUser.getPassword())) {
                oldUser.setPassword(request.getPassword());
            }
        }

        return oldUser;
    }

//    this method require email and password of a previously deactivated account
    @Override
    @Transactional
    public UserResponse activateUser(String email) {

        User savedUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        savedUser.setActive(true);
        return new UserResponse(
                savedUser.getStudentNumber(),
                savedUser.getName(),
                savedUser.getLastname(),
                savedUser.getRole()
        );
    }

    @Override
    @Transactional
    public void deactivateUser(Long id) {

        User savedUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        savedUser.setActive(false);
//        userRepository.save(savedUser); //we do not have to include this
    }
}