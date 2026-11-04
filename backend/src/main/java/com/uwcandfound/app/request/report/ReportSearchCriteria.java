package com.uwcandfound.app.request.report;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;


import com.uwcandfound.app.models.Reports.ReportStatus;
import com.uwcandfound.app.models.Reports.ReportType;
import com.uwcandfound.app.request.QueryParams;

import jakarta.validation.constraints.Size;

// Filters for "My Reports" (GET /api/reports/mine?type=lost&status=open&q=phone&page=0&size=10).
// Filled from the URL query string, not from a JSON body.
//
// Every field is optional; null means "don't filter on this".
// The owner is NOT here: the service always filters on the logged-in user.
// The service should also check that dateFrom is not after dateTo.
public record ReportSearchCriteria(

        ReportType type,            // the All / Lost / Found tabs
        ReportStatus status,        // the status dropdown

        @Size(max = 100)
        String q,                   // the search box: item name or report ID

        Long categoryId,
        Long locationId,

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate dateFrom,

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate dateTo,

        Integer page,
        Integer size) {

    // Runs whenever the record is built: clean up the values.
    public ReportSearchCriteria {
        q = QueryParams.text(q);
        page = QueryParams.page(page);
        size = QueryParams.size(size);
    }
}