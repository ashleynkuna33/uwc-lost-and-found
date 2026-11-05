package com.uwcandfound.app.repositories;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.uwcandfound.app.models.Reports;
import com.uwcandfound.app.models.Reports.ReportStatus;
import com.uwcandfound.app.models.Reports.ReportType;

// JpaRepository<Entity, IdType>: Spring generates findById, save, delete and so on.
public interface ReportRepository extends JpaRepository<Reports, Long> {

    // One search for both sides. Any parameter that is null is ignored,
    // so userId == null means "every user" (the admin list).
    // reportId is the search text read as an ID, or null if it isn't one.
    @Query("""
            select r from Reports r
            where (:userId is null or r.reportedBy.id = :userId)
              and (:type is null or r.reportType = :type)
              and (:status is null or r.status = :status)
              and (:categoryId is null or r.category.categoriesId = :categoryId)
              and (:locationId is null or r.location.id = :locationId)
              and (:dateFrom is null or r.dateOccurred >= :dateFrom)
              and (:dateTo is null or r.dateOccurred <= :dateTo)
              and (:q is null
                   or lower(r.itemName) like lower(concat('%', :q, '%'))
                   or r.id = :reportId)
            """)
    Page<Reports> search(
            @Param("userId") Long userId,
            @Param("type") ReportType type,
            @Param("status") ReportStatus status,
            @Param("categoryId") Long categoryId,
            @Param("locationId") Long locationId,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("q") String q,
            @Param("reportId") Long reportId,
            Pageable pageable);

    // Spring builds these from the method names ("ReportedById" = reportedBy.id).
    long countByReportedById(Long userId);

    long countByReportedByIdAndStatus(Long userId, ReportStatus status);

    long countByReportedByIdAndReportType(Long userId, ReportType type);
}