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
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(name = "student_number", length = 20, nullable = true)
    private Long studentNumber;

    @Column(name = "first_name", length = 60)
    private String name;

    @Column(name = "last_name", length = 60)
    private String lastname;

    @Column(name = "email", length = 255, unique = true)
    private String email;

    @Column(name = "password_hash", length = 255)
    private String password;

    @Column(name = "phone", length = 20)
    private String phoneNumber;

    public enum Role {
        STUDENT,
        ADMINISTRATOR
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Column(name = "is_active")
    private boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
