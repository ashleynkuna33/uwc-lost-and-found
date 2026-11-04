package com.uwcandfound.app.request.report;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import com.uwcandfound.app.models.Reports.ReportStatus;
import com.uwcandfound.app.models.Reports.ReportType;
import com.uwcandfound.app.request.QueryParams;

import jakarta.validation.constraints.Size;

// Filters for the admin report list (GET /api/admin/reports).
// Same filters as the student search, plus reporterId. There is no owner
// filter: admins see every report.
public record AdminReportSearchCriteria(

        ReportType type,
        ReportStatus status,

        @Size(max = 100)
        String q,

        Long categoryId,
        Long locationId,

        // Show one person's reports only.
        Long reporterId,

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate dateFrom,

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate dateTo,

        Integer page,
        Integer size) {

    public AdminReportSearchCriteria {
        q = QueryParams.text(q);
        page = QueryParams.page(page);
        size = QueryParams.size(size);
    }
}
