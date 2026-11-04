package com.uwcandfound.app.request.report;

import java.time.LocalDate;

import com.uwcandfound.app.models.Reports;
import com.uwcandfound.app.models.Reports.ReportType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

// What the "New Report" form may send (POST /api/reports).

// Left out on purpose, because the server controls them:
// id, reportedBy (comes from the login token), status, createdAt, images.
// Photos arrive as separate files in the same multipart request.
public record CreateReportRequest(

        @NotNull(message = "Choose lost or found")
        ReportType reportType,

        @NotBlank(message = "Item name is required")
        @Size(max = 150, message = "Item name must be 150 characters or fewer")
        String itemName,

        @NotBlank(message = "Description is required")
        @Size(max = 2000, message = "Description must be 2000 characters or fewer")
        String description,

        // The dropdown sends the ID; the service loads the real Category.
        @NotNull(message = "Choose a category")
        @Positive
        Long categoryId,

        @NotNull(message = "Choose a location")
        @Positive
        Long locationId,

        @Size(max = 255, message = "Location details must be 255 characters or fewer")
        String locationDetails,

        @NotNull(message = "Date is required")
        @PastOrPresent(message = "Date cannot be in the future")
        LocalDate dateOccurred) {
}