package com.uwcandfound.app.services.Report;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.uwcandfound.app.models.Categories;
import com.uwcandfound.app.models.Item;
import com.uwcandfound.app.models.ItemImage;
import com.uwcandfound.app.models.Locations;
import com.uwcandfound.app.models.Reports;
import com.uwcandfound.app.models.Reports.ReportStatus;
import com.uwcandfound.app.models.Reports.ReportType;
import com.uwcandfound.app.models.User;
import com.uwcandfound.app.repositories.CategoriesRepository;
import com.uwcandfound.app.repositories.ItemRepository;
import com.uwcandfound.app.repositories.LocationRepository;
import com.uwcandfound.app.repositories.ReportRepository;
import com.uwcandfound.app.repositories.UserRepository;
import com.uwcandfound.app.request.report.AdminReportResponse;
import com.uwcandfound.app.request.report.AdminReportSearchCriteria;
import com.uwcandfound.app.request.report.CreateReportRequest;
import com.uwcandfound.app.request.report.ReportCountsResponse;
import com.uwcandfound.app.request.report.ReportDetailResponse;
import com.uwcandfound.app.request.report.ReportSearchCriteria;
import com.uwcandfound.app.request.report.ReportSummaryResponse;
import com.uwcandfound.app.request.report.UpdateReportRequest;
import com.uwcandfound.app.request.report.UpdateReportStatusRequest;

import lombok.RequiredArgsConstructor;

// Business rules for reports.
//
// A report (Reports) is the link between a user and an item: who submitted it
// and which item it is about. The OBJECT (Item) holds the type (lost/found),
// details, photos and status. Creating a report makes both rows in one transaction.
//
// Item is the existing entity and is not changed. It uses Item.Type and
// Item.Status; the request/response classes use ReportType and ReportStatus.
// The enums have identical names, so the small converters at the bottom
// translate between them.
//
// Status rules, enforced here:
//   - an item starts "open"; details can be edited only while it is open
//   - the reporter can close an open item (withdrawn) or a returned one
//   - an admin can close an item with a reason
//   - "claimed" and "returned" are NEVER set here; the claim process owns them
//   - "closed" is final
//
// Controllers pass in the logged-in user's email (read from the JWT), never
// anything from request data. Every response is built inside the transaction,
// because category, location, item and images are lazy.
@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final ItemRepository itemsRepository;
    private final UserRepository userRepository;
    private final CategoriesRepository categoryRepository;
    private final LocationRepository locationRepository;

    // =====================================================================
    // Student side
    // =====================================================================

    // POST /api/reports
    // Makes the item and its report together. Photos are not saved yet;
    // that needs FileStorageService.
    @Transactional
    public ReportDetailResponse create(CreateReportRequest request, String email) {
        User user = userOf(email);
        Categories category = findCategory(request.categoryId());
        Locations location = findLocation(request.locationId());

        String studentNumber = user.getStudentNumber();
        if (studentNumber == null || studentNumber.isBlank()) {
            throw error(HttpStatus.FORBIDDEN, "Account has no student number");
        }

        Item item = new Item();
        item.setStudentNumber(studentNumber);              // from the token's user, never the request
        item.setType(toItemType(request.reportType()));
        item.setItemName(request.itemName().trim());
        item.setDescription(request.description().trim());
        item.setCategory(category);
        item.setLocation(location);
        item.setLocationDetails(request.locationDetails());
        item.setDateOccurred(toDateTime(request.dateOccurred()));
        // status is OPEN by default (set in the entity)
        itemsRepository.save(item);

        Reports report = new Reports();
        report.setReportedBy(user);
        report.setItem(item);
        // createdAt is automatic

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
                reportRepository.countByReportedByIdAndItemStatus(userId, Item.Status.OPEN),
                reportRepository.countByReportedByIdAndItemStatus(userId, Item.Status.RETURNED),
                reportRepository.countByReportedByIdAndItemType(userId, Item.Type.LOST),
                reportRepository.countByReportedByIdAndItemType(userId, Item.Type.FOUND));
    }

    // GET /api/reports/{id}
    @Transactional(readOnly = true)
    public ReportDetailResponse getDetail(Long reportId, String email) {
        return toDetail(findOwned(reportId, idOf(email)));
    }

    // PUT /api/reports/{id}
    // The report never changes; the edit goes to the item. No save() call is
    // needed: inside a transaction, Hibernate notices the changed fields.
    @Transactional
    public ReportDetailResponse update(Long reportId, UpdateReportRequest request, String email) {
        Reports report = findOwned(reportId, idOf(email));
        Item item = report.getItem();

        if (item.getStatus() != Item.Status.OPEN) {
            throw error(HttpStatus.CONFLICT, "Only open reports can be edited");
        }

        item.setItemName(request.itemName().trim());
        item.setDescription(request.description().trim());
        item.setCategory(findCategory(request.categoryId()));
        item.setLocation(findLocation(request.locationId()));
        item.setLocationDetails(request.locationDetails());
        item.setDateOccurred(toDateTime(request.dateOccurred()));

        return toDetail(report);
    }

    // PATCH /api/reports/{id}/close
    @Transactional
    public ReportDetailResponse close(Long reportId, String email) {
        User user = userOf(email);
        Reports report = findOwned(reportId, user.getId());
        Item item = report.getItem();

        // The reporter may close an open item (withdrawn) or a returned one.
        // A claimed item is mid-handover, so only the claim process or an admin
        // can resolve it. Closed is final.
        boolean allowed = item.getStatus() == Item.Status.OPEN
                || item.getStatus() == Item.Status.RETURNED;
        if (!allowed) {
            throw error(HttpStatus.CONFLICT, "This report cannot be closed from its current status");
        }

        String reason = item.getStatus() == Item.Status.OPEN
                ? "Withdrawn by the reporter"
                : "Closed after the item was returned";
        closeReport(report, user, reason);

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
    // Includes reporter details, so only the admin controller may return it.
    @Transactional(readOnly = true)
    public AdminReportResponse adminGet(Long reportId) {
        return toAdminDetail(find(reportId));
    }

    // PATCH /api/admin/reports/{id}/status
    // Admins can only CLOSE here, with a reason that is stored together with
    // who did it. "claimed" and "returned" belong to the claim process.
    // TODO (claim logic): pending claims on this item should be rejected when it closes.
    @Transactional
    public ReportDetailResponse adminSetStatus(Long reportId, UpdateReportStatusRequest request,
            String adminEmail) {
        if (request.status() != ReportStatus.CLOSED) {
            throw error(HttpStatus.BAD_REQUEST,
                    "Only closing is allowed here; claimed and returned are set by the claim process");
        }
        if (request.reason() == null || request.reason().isBlank()) {
            throw error(HttpStatus.BAD_REQUEST, "A reason is required when closing a report");
        }

        User admin = userOf(adminEmail);
        Reports report = find(reportId);

        if (report.getItem().getStatus() == Item.Status.CLOSED) {
            throw error(HttpStatus.CONFLICT, "This report is already closed");
        }

        closeReport(report, admin, request.reason().trim());
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

        // Item.dateOccurred is a date-time, so the range runs from the start of
        // dateFrom up to (not including) the start of the day after dateTo.
        LocalDateTime from = toDateTime(dateFrom);
        LocalDateTime to = dateTo == null ? null : dateTo.plusDays(1).atStartOfDay();

        return reportRepository
                .search(userId, toItemType(type), toItemStatus(status), categoryId, locationId,
                        from, to, q, parseReportId(q), pageable)
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

    // Closes the item and records who closed it, when, and why. Closed is final.
    private void closeReport(Reports report, User closedBy, String reason) {
        report.getItem().setStatus(Item.Status.CLOSED);
        report.setClosedReason(reason);
        report.setClosedBy(closedBy);
        report.setClosedAt(LocalDateTime.now());
    }

    // The email comes from the validated JWT; this finds that user.
    private User userOf(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> error(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private Long idOf(String email) {
        return userOf(email).getId();
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

    // ---- enum / date converters (Item <-> request/response classes) ----

    private static Item.Type toItemType(ReportType t) {
        return t == null ? null : Item.Type.valueOf(t.name());
    }

    private static ReportType toReportType(Item.Type t) {
        return t == null ? null : ReportType.valueOf(t.name());
    }

    private static Item.Status toItemStatus(ReportStatus s) {
        return s == null ? null : Item.Status.valueOf(s.name());
    }

    private static ReportStatus toReportStatus(Item.Status s) {
        return s == null ? null : ReportStatus.valueOf(s.name());
    }

    private static LocalDateTime toDateTime(LocalDate d) {
        return d == null ? null : d.atStartOfDay();
    }

    private static LocalDate toDate(LocalDateTime dt) {
        return dt == null ? null : dt.toLocalDate();
    }

    // ---- report + item -> response (move into a ReportMapper class later) ----

    private ReportSummaryResponse toSummary(Reports r) {
        Item i = r.getItem();
        return new ReportSummaryResponse(
                r.getId(),
                reference(r.getId()),
                toReportType(i.getType()),
                i.getItemName(),
                i.getCategory().getName(),
                i.getLocation().getName(),
                toDate(i.getDateOccurred()),
                toReportStatus(i.getStatus()),
                // images are a Set, so "first" is any one of them
                i.getItemImages().stream().map(ItemImage::getImagePath).findFirst().orElse(null));
    }

    private ReportDetailResponse toDetail(Reports r) {
        Item i = r.getItem();
        return new ReportDetailResponse(
                r.getId(),
                reference(r.getId()),
                toReportType(i.getType()),
                i.getItemName(),
                i.getDescription(),
                i.getCategory().getName(),
                i.getLocation().getName(),
                i.getLocationDetails(),
                toDate(i.getDateOccurred()),
                toReportStatus(i.getStatus()),
                r.getCreatedAt(),
                i.getItemImages().stream().map(ItemImage::getImagePath).toList());
    }

    // Same as toDetail, plus reporter and closing details. Admin endpoints only.
    private AdminReportResponse toAdminDetail(Reports r) {
        Item i = r.getItem();
        User reporter = r.getReportedBy();
        User closer = r.getClosedBy();
        return new AdminReportResponse(
                r.getId(),
                reference(r.getId()),
                toReportType(i.getType()),
                i.getItemName(),
                i.getDescription(),
                i.getCategory().getName(),
                i.getLocation().getName(),
                i.getLocationDetails(),
                toDate(i.getDateOccurred()),
                toReportStatus(i.getStatus()),
                r.getCreatedAt(),
                i.getItemImages().stream().map(ItemImage::getImagePath).toList(),
                reporter.getId(),
                reporter.getEmail(),
                r.getClosedReason(),
                closer == null ? null : closer.getEmail(),
                r.getClosedAt());
    }

    // "LF-000123": built from the report ID, never stored.
    private String reference(Long id) {
        return "LF-" + String.format("%06d", id);
    }
}