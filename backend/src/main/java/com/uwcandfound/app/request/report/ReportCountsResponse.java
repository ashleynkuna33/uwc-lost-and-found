package com.uwcandfound.app.request.report;


 
// The numbers on the "My Reports" screen. Not backed by any entity: the
// service calculates them from the logged-in user's reports on every request.
//
//   Total reports card  -> totalReports (also the "All" tab)
//   Open reports card   -> openReports
//   Returned items card -> returnedReports
//   Lost / Found tabs   -> lostCount / foundCount
//
// Primitive longs, so a student with no reports gets 0, never null.
public record ReportCountsResponse(
        long totalReports,
        long openReports,
        long returnedReports,
        long lostCount,
        long foundCount) {
}
 