package com.uwcandfound.app.request.report;

import java.time.LocalDate;

import com.uwcandfound.app.models.Reports.ReportStatus;
import com.uwcandfound.app.models.Reports.ReportType;

// One row in a report list. The order of these fields must match the
// arguments in ReportService.toSummary().
public record ReportSummaryResponse(
        Long id,
        String reference,
        ReportType reportType,
        String itemName,
        String category,
        String location,
        LocalDate dateOccurred,
        ReportStatus status,
        String thumbnail) {
}