package com.uwcandfound.app.repositories;

import com.uwcandfound.app.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
    boolean existsByStudentNumber(String studentNumber);
    boolean existsByPhoneNumber(String phoneNumber);

}
