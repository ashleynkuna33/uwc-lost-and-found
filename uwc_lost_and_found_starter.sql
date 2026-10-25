-- UWC Campus Lost & Found - Starter Database for Spring Boot
-- MySQL 8+ | Run on a NEW database. No triggers, procedures, or generated columns.
-- Uses INT UNSIGNED consistently across primary and foreign keys.

CREATE DATABASE IF NOT EXISTS uwc_lost_found_starter
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE uwc_lost_found_starter;

-- 1. Students and administrators use the same account table.
-- Public registration must always assign role='student' in Spring Boot.
CREATE TABLE users (
    user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_number VARCHAR(20) UNIQUE NULL,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Item category dropdown values.
CREATE TABLE categories (
    category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 3. Campus location dropdown values.
CREATE TABLE locations (
    location_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 4. Lost and found reports.
CREATE TABLE items (
    item_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reported_by INT UNSIGNED NOT NULL,
    report_type ENUM('lost', 'found') NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    location_id INT UNSIGNED NOT NULL,
    location_details VARCHAR(255) NULL,
    date_occurred DATE NOT NULL,
    status ENUM('open', 'claimed', 'returned', 'closed') NOT NULL DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reported_by) REFERENCES users(user_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    FOREIGN KEY (location_id) REFERENCES locations(location_id),
    INDEX idx_items_filters (report_type, status, category_id, location_id, date_occurred),
    INDEX idx_items_reported_by (reported_by)
) ENGINE=InnoDB;

-- 5. Photos of lost/found items (paths/URLs, not binary image files).
CREATE TABLE item_images (
    image_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    item_id INT UNSIGNED NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Ownership claims on found items.
CREATE TABLE claims (
    claim_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    item_id INT UNSIGNED NOT NULL,
    claimant_id INT UNSIGNED NOT NULL,
    explanation TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    reviewed_by INT UNSIGNED NULL,
    admin_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (item_id) REFERENCES items(item_id),
    FOREIGN KEY (claimant_id) REFERENCES users(user_id),
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id),
    INDEX idx_claims_status (status),
    INDEX idx_claims_claimant (claimant_id)
) ENGINE=InnoDB;

-- 7. Optional supporting evidence files for claims.
CREATE TABLE claim_evidence (
    evidence_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    claim_id INT UNSIGNED NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    FOREIGN KEY (claim_id) REFERENCES claims(claim_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Simple in-app notifications.
CREATE TABLE notifications (
    notification_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_notifications_user (user_id, is_read)
) ENGINE=InnoDB;

-- Initial dropdown data. Replace or extend as needed.
INSERT INTO categories (name) VALUES
('Electronics'), ('Student/ID Cards'), ('Wallets & Purses'),
('Keys'), ('Bags'), ('Books & Stationery'), ('Clothing'), ('Other');

INSERT INTO locations (name) VALUES
('Library'), ('Student Centre'), ('Lecture Venues'),
('Computer Labs'), ('Cafeteria'), ('Residences'),
('Sports Grounds'), ('Parking Areas'), ('Other');

-- Implementation notes:
-- * Spring Boot must validate student_number for students and hash passwords.
-- * Spring Security must enforce roles. Never trust role from a public signup request.
-- * Claims are only for FOUND items; validate this in the service layer.
-- * On claim approval, check no other approved claim exists, update item status,
--   and reject other pending claims in one transaction with appropriate locking.
-- * Store uploaded photos/evidence outside the database; save only paths here.
-- * Prefer Flyway migrations after the initial schema is agreed upon.
