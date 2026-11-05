package com.uwcandfound.app.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.uwcandfound.app.request.report.CreateReportRequest;
import com.uwcandfound.app.request.report.ReportSearchCriteria;
import com.uwcandfound.app.request.report.UpdateReportRequest;
import com.uwcandfound.app.request.report.ReportCountsResponse;
import com.uwcandfound.app.request.report.ReportDetailResponse;
import com.uwcandfound.app.request.report.ReportSummaryResponse;
import com.uwcandfound.app.security.CurrentPrincipalService;
import com.uwcandfound.app.services.Report.ReportService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// Student endpoints for reports. Thin on purpose: it turns HTTP into a
// service call and nothing else. No business rules live here.
//
// The logged-in user's email comes from CurrentPrincipalService (which reads
// the validated JWT), never from the URL or the request body.
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final CurrentPrincipalService currentPrincipalService;

    // POST /api/reports  -> 201 Created
    // @Valid runs the annotations on CreateReportRequest before this method
    // starts. Photo upload is not part of this yet.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReportDetailResponse create(@Valid @RequestBody CreateReportRequest request) {
        return reportService.create(request, currentPrincipalService.getCurrentUserEmail());
    }

    // GET /api/reports/mine?type=lost&status=open&q=phone&page=0&size=10
    // Query parameters are bound onto ReportSearchCriteria automatically.
    @GetMapping("/user")
    public Page<ReportSummaryResponse> getMine(@Valid ReportSearchCriteria criteria) {
        return reportService.getMine(criteria, currentPrincipalService.getCurrentUserEmail());
    }

    // GET /api/reports/mine/counts  -> the three cards and the tab counts
    @GetMapping("/user/counts")
    public ReportCountsResponse getMyCounts() {
        return reportService.getMyCounts(currentPrincipalService.getCurrentUserEmail());
    }

    // GET /api/reports/{id}  -> the "Report details" panel
    @GetMapping("/{id}")
    public ReportDetailResponse getDetail(@PathVariable Long id) {
        return reportService.getDetail(id, currentPrincipalService.getCurrentUserEmail());
    }

    // PUT /api/reports/{id}  -> owner edits their own open report
    @PutMapping("/{id}")
    public ReportDetailResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReportRequest request) {
        return reportService.update(id, request, currentPrincipalService.getCurrentUserEmail());
    }

    // PATCH /api/reports/{id}/close  -> owner closes their own report
    @PatchMapping("/{id}/close")
    public ReportDetailResponse close(@PathVariable Long id) {
        return reportService.close(id, currentPrincipalService.getCurrentUserEmail());
    }
}