package com.uwcandfound.app.controller;

import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uwcandfound.app.request.report.AdminReportResponse;
import com.uwcandfound.app.request.report.AdminReportSearchCriteria;
import com.uwcandfound.app.request.report.ReportDetailResponse;
import com.uwcandfound.app.request.report.ReportSummaryResponse;
import com.uwcandfound.app.request.report.UpdateReportStatusRequest;
import com.uwcandfound.app.services.Report.ReportService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// Admin endpoints for reports. Every URL here starts with /api/admin, and
// SecurityConfig must restrict /api/admin/** to the admin role. That URL
// rule is what keeps students out; nothing in this class checks the role.
@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminreportController {

    private final ReportService reportService;

    // GET /api/admin/reports?reporterId=7&status=open&q=wallet&page=0&size=10
    // Same filters as the student list, plus reporterId, and no owner filter.
    @GetMapping
    public Page<ReportSummaryResponse> search(@Valid AdminReportSearchCriteria criteria) {
        return reportService.adminSearch(criteria);
    }

    // GET /api/admin/reports/{id}  -> any report, not only your own
    @GetMapping("/{id}")
    public AdminReportResponse get(@PathVariable Long id) {
        return reportService.adminGet(id);
    }

    // PATCH /api/admin/reports/{id}/status
    // A reason is required when the new status is "closed".
    @PatchMapping("/{id}/status")
    public ReportDetailResponse setStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReportStatusRequest request,
            Authentication authentication) {
        return reportService.adminSetStatus(id, request, authentication.getName());
    }
}