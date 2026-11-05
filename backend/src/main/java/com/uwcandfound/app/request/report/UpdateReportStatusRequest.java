package com.uwcandfound.app.request.report;

import com.uwcandfound.app.models.Reports.ReportStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// Admin changes a report's status (PATCH /api/admin/reports/{id}/status).
//
// The service decides which transitions are allowed, for example a report
// cannot become "returned" without an approved claim, and a reason is
// required when closing. Those rules need the database, so they are not
// annotations here.
public record UpdateReportStatusRequest(

        @NotNull(message = "Status is required")
        ReportStatus status,

        @Size(max = 255, message = "Reason must be 255 characters or fewer")
        String reason) {
}