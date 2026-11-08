package com.uwcandfound.app.repositories;


import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.uwcandfound.app.models.Notification;

// Every query is scoped by the owner's email, so one student can never read or
// change another student's notifications.
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUser_EmailOrderByCreatedAtDesc(String email, Pageable pageable);

    Page<Notification> findByUser_EmailAndReadFalseOrderByCreatedAtDesc(String email, Pageable pageable);

    long countByUser_EmailAndReadFalse(String email);

    Optional<Notification> findByIdAndUser_Email(Long id, String email);

    @Modifying(clearAutomatically = true)
    @Query("""
            update Notification n
               set n.read = true
             where n.read = false
               and n.user.id = (select u.id from User u where u.email = :email)
            """)
    int markAllRead(@Param("email") String email);
}