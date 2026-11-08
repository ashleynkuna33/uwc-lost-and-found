package com.uwcandfound.app.request.report;

 
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.uwcandfound.app.models.Reports.ReportStatus;
import com.uwcandfound.app.models.Reports.ReportType;
 
// The "Report details" panel: everything in the summary, plus the long
// text, the extra location note, when it was filed, and all photos.
//
// No reporter details here. Students never receive another person's
// contact information; the admin version (AdminReportResponse) adds it.
public record ReportDetailResponse(
        Long id,
        String reference,
        ReportType reportType,
        String itemName,
        String description,
        String categoryName,
        String locationName,
        String locationDetails,
        LocalDate dateOccurred,
        ReportStatus status,
        LocalDateTime createdAt
) {
}
 