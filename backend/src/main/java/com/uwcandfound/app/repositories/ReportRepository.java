package com.uwcandfound.app.repositories;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.uwcandfound.app.models.Item;
import com.uwcandfound.app.models.Reports;

// A report links a user to an item. Who reported it lives on the report
// (r.reportedBy). Type, status, category, location, date and name live on the
// item, so the queries reach them through r.item.
public interface ReportRepository extends JpaRepository<Reports, Long> {

    // One search for both sides. Any parameter that is null is ignored,
    // so userId == null means "every user" (the admin list).
    // reportId is the search text read as a report ID, or null if it isn't one.
    // dateFrom is inclusive, dateTo is exclusive (the service passes the start of the next day).
    @Query("""
            select r from Reports r
            where (:userId is null or r.reportedBy.id = :userId)
              and (:type is null or r.item.type = :type)
              and (:status is null or r.item.status = :status)
              and (:categoryId is null or r.item.category.categoriesId = :categoryId)
              and (:locationId is null or r.item.location.id = :locationId)
              and (:dateFrom is null or r.item.dateOccurred >= :dateFrom)
              and (:dateTo is null or r.item.dateOccurred < :dateTo)
              and (:q is null
                   or lower(r.item.itemName) like lower(concat('%', :q, '%'))
                   or r.id = :reportId)
            """)
    Page<Reports> search(
            @Param("userId") Long userId,
            @Param("type") Item.Type type,
            @Param("status") Item.Status status,
            @Param("categoryId") Long categoryId,
            @Param("locationId") Long locationId,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            @Param("q") String q,
            @Param("reportId") Long reportId,
            Pageable pageable);

    // Spring builds these from the method names.
    // "ReportedById" = reportedBy.id, "ItemStatus" = item.status, "ItemType" = item.type.
    long countByReportedById(Long userId);

    long countByReportedByIdAndItemStatus(Long userId, Item.Status status);

    long countByReportedByIdAndItemType(Long userId, Item.Type type);
}