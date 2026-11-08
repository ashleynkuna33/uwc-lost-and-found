package com.uwcandfound.app.services.Report;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.uwcandfound.app.models.Categories;
import com.uwcandfound.app.models.ItemImage;
import com.uwcandfound.app.models.Locations;
import com.uwcandfound.app.models.Reports;
import com.uwcandfound.app.models.Reports.ReportStatus;
import com.uwcandfound.app.models.Reports.ReportType;
import com.uwcandfound.app.models.User;
import com.uwcandfound.app.repositories.CategoriesRepository;
import com.uwcandfound.app.repositories.LocationRepository;
import com.uwcandfound.app.repositories.ReportRepository;
import com.uwcandfound.app.repositories.UserRepository;
import com.uwcandfound.app.request.report.AdminReportSearchCriteria;
import com.uwcandfound.app.request.report.CreateReportRequest;
import com.uwcandfound.app.request.report.ReportCountsResponse;
import com.uwcandfound.app.request.report.ReportDetailResponse;
import com.uwcandfound.app.request.report.ReportSearchCriteria;
import com.uwcandfound.app.request.report.ReportSummaryResponse;
import com.uwcandfound.app.request.report.UpdateReportRequest;
import com.uwcandfound.app.request.report.UpdateReportStatusRequest;

import lombok.RequiredArgsConstructor;

// Business rules for reports. Controllers call this class; it never touches
// HTTP. The logged-in user's email is passed in by the controller (read from
// the JWT), never taken from request data. This class turns it into a user.
//
// Every method that returns a response builds it inside the transaction,
// because category, location and images are lazy and can only be read while
// the transaction is open.
//
// Errors use Spring's ResponseStatusException for now, so no extra exception
// classes are needed. Swap in your own exceptions later if you want.
@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final CategoriesRepository categoryRepository;
    private final LocationRepository locationRepository;

    // =====================================================================
    // Student side
    // =====================================================================

    // POST /api/reports
    // Photos are not saved here yet; that needs FileStorageService.
    @Transactional
    public ReportDetailResponse create(CreateReportRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "User not found"));
        Categories category = findCategory(request.categoryId());
        Locations location = findLocation(request.locationId());

        Reports report = new Reports();
        report.setReportedBy(user);                 // from the token, never the request
        report.setReportType(request.reportType());
        report.setItemName(request.itemName().trim());
        report.setDescription(request.description().trim());
        report.setCategory(category);
        report.setLocation(location);
        report.setLocationDetails(request.locationDetails());
        report.setDateOccurred(request.dateOccurred());
        // status is "open" by default (set in the entity); createdAt is automatic

        return toDetail(reportRepository.save(report));
    }

    // GET /api/reports/mine
    @Transactional(readOnly = true)
    public Page<ReportSummaryResponse> getMine(ReportSearchCriteria c, String email) {
        return search(idOf(email), c.type(), c.status(), c.q(), c.categoryId(), c.locationId(),
                c.dateFrom(), c.dateTo(), c.page(), c.size());
    }

    // GET /api/reports/mine/counts
    // Calculated every time; nothing is stored.
    @Transactional(readOnly = true)
    public ReportCountsResponse getMyCounts(String email) {
        Long userId = idOf(email);
        return new ReportCountsResponse(
                reportRepository.countByReportedById(userId),
                reportRepository.countByReportedByIdAndStatus(userId, ReportStatus.open),
                reportRepository.countByReportedByIdAndStatus(userId, ReportStatus.returned),
                reportRepository.countByReportedByIdAndReportType(userId, ReportType.lost),
                reportRepository.countByReportedByIdAndReportType(userId, ReportType.found));
    }

    // GET /api/reports/{id}
    @Transactional(readOnly = true)
    public ReportDetailResponse getDetail(Long reportId, String email) {
        return toDetail(findOwned(reportId, idOf(email)));
    }

    // PUT /api/reports/{id}
    // No save() call is needed: inside a transaction, Hibernate notices the
    // changed fields and writes them when the method finishes.
    @Transactional
    public ReportDetailResponse update(Long reportId, UpdateReportRequest request, String email) {
        Reports report = findOwned(reportId, idOf(email));

        if (report.getStatus() != ReportStatus.open) {
            throw error(HttpStatus.CONFLICT, "Only open reports can be edited");
        }

        report.setItemName(request.itemName().trim());
        report.setDescription(request.description().trim());
        report.setCategory(findCategory(request.categoryId()));
        report.setLocation(findLocation(request.locationId()));
        report.setLocationDetails(request.locationDetails());
        report.setDateOccurred(request.dateOccurred());

        return toDetail(report);
    }

    // PATCH /api/reports/{id}/close
    @Transactional
    public ReportDetailResponse close(Long reportId, String email) {
        Reports report = findOwned(reportId, idOf(email));

        if (report.getStatus() == ReportStatus.closed || report.getStatus() == ReportStatus.returned) {
            throw error(HttpStatus.CONFLICT, "This report is already finished");
        }

        report.setStatus(ReportStatus.closed);
        return toDetail(report);
    }

    // =====================================================================
    // Admin side. Only call these from /api/admin/** endpoints.
    // =====================================================================

    // GET /api/admin/reports
    @Transactional(readOnly = true)
    public Page<ReportSummaryResponse> adminSearch(AdminReportSearchCriteria c) {
        // c.reporterId() may be null, which means "all reporters"
        return search(c.reporterId(), c.type(), c.status(), c.q(), c.categoryId(), c.locationId(),
                c.dateFrom(), c.dateTo(), c.page(), c.size());
    }

    // GET /api/admin/reports/{id}
    @Transactional(readOnly = true)
    public ReportDetailResponse adminGet(Long reportId) {
        return toDetail(find(reportId));
    }

    // PATCH /api/admin/reports/{id}/status
    // TODO when ClaimService exists: refuse "returned" unless a claim is approved.
    // The reason is checked but not stored yet; there is no column for it.
    @Transactional
    public ReportDetailResponse adminSetStatus(Long reportId, UpdateReportStatusRequest request) {
        Reports report = find(reportId);

        boolean closing = request.status() == ReportStatus.closed;
        boolean noReason = request.reason() == null || request.reason().isBlank();
        if (closing && noReason) {
            throw error(HttpStatus.BAD_REQUEST, "A reason is required when closing a report");
        }

        report.setStatus(request.status());
        return toDetail(report);
    }

    // =====================================================================
    // Helpers
    // =====================================================================

    // One search used by both sides. userId == null means "every user".
    private Page<ReportSummaryResponse> search(Long userId, ReportType type, ReportStatus status,
            String q, Long categoryId, Long locationId, LocalDate dateFrom, LocalDate dateTo,
            int page, int size) {

        if (dateFrom != null && dateTo != null && dateFrom.isAfter(dateTo)) {
            throw error(HttpStatus.BAD_REQUEST, "dateFrom cannot be after dateTo");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        return reportRepository
                .search(userId, type, status, categoryId, locationId, dateFrom, dateTo,
                        q, parseReportId(q), pageable)
                .map(this::toSummary);
    }

    // The search box accepts a report ID as "42" or "LF-000042".
    private Long parseReportId(String q) {
        if (q == null) {
            return null;
        }
        String digits = q.toUpperCase().startsWith("LF-") ? q.substring(3) : q;
        return digits.matches("\\d{1,18}") ? Long.valueOf(digits) : null;
    }

    // The email comes from the validated JWT; this finds that user's ID.
    private Long idOf(String email) {
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> error(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private Reports find(Long reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Report not found"));
    }

    // Someone else's report gets the same 404 as a missing one, so nobody
    // can probe which report IDs exist.
    private Reports findOwned(Long reportId, Long userId) {
        Reports report = find(reportId);
        if (!report.getReportedBy().getId().equals(userId)) {
            throw error(HttpStatus.NOT_FOUND, "Report not found");
        }
        return report;
    }

    // Call methods on the field (categoryRepository), never on the class name.
    // findById returns an Optional, so orElseThrow turns "not found" into a 400.
    private Categories findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> error(HttpStatus.BAD_REQUEST, "Category does not exist"));
    }

    private Locations findLocation(Long id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> error(HttpStatus.BAD_REQUEST, "Location does not exist"));
    }

    private static ResponseStatusException error(HttpStatus status, String message) {
        return new ResponseStatusException(status, message);
    }

    // ---- entity -> response (move into a ReportMapper class later) ----

    private ReportSummaryResponse toSummary(Reports r) {
        return new ReportSummaryResponse(
                r.getId(),
                reference(r.getId()),
                r.getReportType(),
                r.getItemName(),
                r.getCategory().getName(),
                r.getLocation().getName(),
                r.getDateOccurred(),
                r.getStatus());
    }

    private ReportDetailResponse toDetail(Reports r) {
        return new ReportDetailResponse(
                r.getId(),
                reference(r.getId()),
                r.getReportType(),
                r.getItemName(),
                r.getDescription(),
                r.getCategory().getName(),
                r.getLocation().getName(),
                r.getLocationDetails(),
                r.getDateOccurred(),
                r.getStatus(),
                r.getCreatedAt());
    }

    // "LF-000123": built from the ID, never stored.
    private String reference(Long id) {
        return "LF-" + String.format("%06d", id);
    }
}