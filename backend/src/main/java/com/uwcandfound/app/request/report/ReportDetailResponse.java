package com.uwcandfound.app.request.report;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.uwcandfound.app.models.Reports.ReportStatus;
import com.uwcandfound.app.models.Reports.ReportType;

// Full report for the owner. The order of these fields must match the
// arguments in ReportService.toDetail().
public record ReportDetailResponse(
        Long id,
        String reference,
        ReportType reportType,
        String itemName,
        String description,
        String category,
        String location,
        String locationDetails,
        LocalDate dateOccurred,
        ReportStatus status,
        LocalDateTime createdAt,
        List<String> images) {
}