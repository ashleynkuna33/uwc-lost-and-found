package com.uwcandfound.app.request.report;

import java.time.LocalDate;

import com.uwcandfound.app.models.Reports.ReportStatus;
import com.uwcandfound.app.models.Reports.ReportType;

// One row in the "My Reports" list. Kept light on purpose: no description,
// no full photo list.
//
// Where each field comes from:
//   entity field:        id, reportType, itemName, dateOccurred, status
//   through relations:   categoryName, locationName, thumbnailUrl (first photo)
//   calculated:          reference (built from the id, not stored)
public record ReportSummaryResponse(
        Long id,
        String reference,       // "LF-000123"
        ReportType reportType,
        String itemName,
        String categoryName,
        String locationName,
        LocalDate dateOccurred,
        ReportStatus status,
        String thumbnailUrl) {  // null when the report has no photo
}