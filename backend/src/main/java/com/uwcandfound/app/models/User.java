package com.uwcandfound.app.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name="users")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(name = "student_number", length = 20, nullable = true, unique = true, updatable = false)
    private String studentNumber;

    @Column(name = "first_name", length = 60, nullable = false)
    private String name;

    @Column(name = "last_name", length = 60, nullable = false)
    private String lastname;

    @Column(name = "email", length = 255, unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", length = 255, nullable = false)
    private String password;

    @Column(name = "phone", length = 20, nullable = true)
    private String phoneNumber;

    public enum Role {
        STUDENT,
        ADMINISTRATOR
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role = Role.STUDENT;

    @Column(name = "is_active")
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
