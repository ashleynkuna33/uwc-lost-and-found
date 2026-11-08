package com.uwcandfound.app.request.report;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.uwcandfound.app.models.Reports.ReportStatus;
import com.uwcandfound.app.models.Reports.ReportType;

// Everything in ReportDetailResponse, plus reporter and closing details.
// Only return this from /api/admin/** endpoints.
public record AdminReportResponse(
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
        List<String> images,
        Long reporterId,
        String reporterEmail,
        String closedReason,
        String closedByEmail,
        LocalDateTime closedAt) {
}