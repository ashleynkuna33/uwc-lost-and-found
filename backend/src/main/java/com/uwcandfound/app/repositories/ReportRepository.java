package com.uwcandfound.app.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.uwcandfound.app.models.Reports;

public interface ReportRepository extends JpaRepository<Reports, Long> {

}
