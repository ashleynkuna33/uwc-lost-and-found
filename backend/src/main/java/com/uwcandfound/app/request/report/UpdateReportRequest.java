package com.uwcandfound.app.request.report;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

// What an owner may change on their own report (PUT /api/reports/{id}).
//
// Same as CreateReportRequest, minus reportType: a lost report must not
// turn into a found one. The service also checks that the caller owns the
// report and that it is still open.
public record UpdateReportRequest(

        @NotBlank(message = "Item name is required")
        @Size(max = 150, message = "Item name must be 150 characters or fewer")
        String itemName,

        @NotBlank(message = "Description is required")
        @Size(max = 2000, message = "Description must be 2000 characters or fewer")
        String description,

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