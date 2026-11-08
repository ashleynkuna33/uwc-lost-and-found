
package com.uwcandfound.app.services.Item;

import com.uwcandfound.app.exceptions.ResourceNotFoundException;
import com.uwcandfound.app.models.Categories;
import com.uwcandfound.app.models.Item;
import com.uwcandfound.app.models.ItemImage;
import com.uwcandfound.app.models.Locations;
import com.uwcandfound.app.repositories.CategoriesRepository;
import com.uwcandfound.app.repositories.ItemRepository;
import com.uwcandfound.app.repositories.LocationRepository;
import com.uwcandfound.app.repositories.UserRepository;
import com.uwcandfound.app.request.ItemRequest;
import com.uwcandfound.app.request.ItemResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ItemsService implements IItem {

    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final CategoriesRepository categoriesRepository;
    private final LocationRepository locationRepository;

    private static final ZoneId APP_ZONE =
            ZoneId.of("Africa/Johannesburg");



    @Override
    @Transactional(readOnly = true)
    public List<ItemResponse> getItems() {

        return itemRepository.findAll()
                .stream()
                .map(item -> new ItemResponse(
                        item.getId(),
                        item.getItemName(),
                        item.getDescription(),
                        item.getType(),
                        item.getStatus(),

                        item.getCategory().getName(),
                        item.getLocation().getName(),

                        item.getLocationDetails(),
                        item.getDateOccurred(),

                        item.getItemImages()
                                .stream()
                                .map(ItemImage::getImagePath)
                                .toList()
                ))
                .toList();
    }


    @Override
    @Transactional(readOnly = true)
    public List<Item> getItemsByStatus(String status) {

        if (status == null || status.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Item status is required"
            );
        }

        try {
            Item.Status itemStatus = Item.Status.valueOf(
                    status.trim().toUpperCase(Locale.ROOT)
            );

            return itemRepository.findByStatus(itemStatus);

        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid item status: " + status
            );
        }
    }

    @Override
    @Transactional
    public Item createItem(ItemRequest request) {

        validateCreateRequest(request);

        // Never trust studentNumber submitted by frontend
        String studentNumber = getAuthenticatedStudentNumber();

        Categories category = getCategory(request.getCategoryId());
        Locations location = getLocation(request.getLocationId());

        Item item = new Item();

        item.setStudentNumber(studentNumber);
        item.setType(request.getType());
        item.setItemName(request.getItemName().trim());
        item.setDescription(request.getDescription());
        item.setCategory(category);
        item.setLocation(location);
        item.setLocationDetails(request.getLocationDetails());

        if (request.getDateOccurred() != null) {
            item.setDateOccurred(
                    LocalDateTime.ofInstant(
                            request.getDateOccurred().toInstant(),
                            APP_ZONE
                    )
            );
        }

        // New reports always start as OPEN
        item.setStatus(Item.Status.OPEN);

        return itemRepository.save(item);
    }


    @Override
    @Transactional
    public Item updateItem(long id, ItemRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Item request is required"
            );
        }

        Item item = findItem(id);

        Authentication authentication = getAuthentication();
        String studentNumber = getAuthenticatedStudentNumber();

        boolean admin = isAdmin(authentication);

        // Only the reporter or an administrator can edit
        if (!admin &&
                !item.getStudentNumber().equals(studentNumber)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot update another student's item"
            );
        }

        // Update only fields supplied
        if (request.getItemName() != null) {
            if (request.getItemName().isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Item name cannot be empty"
                );
            }

            item.setItemName(request.getItemName().trim());
        }

        if (request.getDescription() != null) {
            item.setDescription(request.getDescription());
        }

        if (request.getType() != null) {
            item.setType(request.getType());
        }

        if (request.getCategoryId() != null) {
            item.setCategory(
                    getCategory(request.getCategoryId())
            );
        }

        if (request.getLocationId() != null) {
            item.setLocation(
                    getLocation(request.getLocationId())
            );
        }

        if (request.getLocationDetails() != null) {
            item.setLocationDetails(request.getLocationDetails());
        }

        if (request.getDateOccurred() != null) {
            item.setDateOccurred(
                    LocalDateTime.ofInstant(
                            request.getDateOccurred().toInstant(),
                            APP_ZONE
                    )
            );
        }

        // Only administrators may change report status
        if (request.getStatus() != null) {
            if (!admin &&
                    request.getStatus() != item.getStatus()) {

                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Only administrators can change item status"
                );
            }

            if (admin) {
                item.setStatus(request.getStatus());
            }
        }

        // Do not allow changing the original reporter
        return itemRepository.save(item);
    }

    @Override
    @Transactional(readOnly = true)
    public Item findItem(Long id) {

        if (id == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Item ID is required"
            );
        }

        return itemRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Item not found with ID: " + id
                        )
                );
    }

    @Override
    @Transactional(readOnly = true)
    public Item findItemByName(String name) {

        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Item name is required"
            );
        }

        return itemRepository
                .findFirstByItemNameIgnoreCaseOrderByIdDesc(
                        name.trim()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Item not found with name: " + name
                        )
                );
    }

    private Categories getCategory(Long categoryId) {

        if (categoryId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Category ID is required"
            );
        }

        return categoriesRepository.findById(categoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found: " + categoryId
                        )
                );
    }

    private Locations getLocation(Long locationId) {

        if (locationId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Location ID is required"
            );
        }

        return locationRepository.findById(locationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Location not found: " + locationId
                        )
                );
    }

    private Authentication getAuthentication() {

        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }

        return authentication;
    }

    private String getAuthenticatedStudentNumber() {

        Authentication authentication = getAuthentication();

        // JWT subject is the user's email
        String email = authentication.getName();

        String studentNumber = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Authenticated user not found"
                        )
                )
                .getStudentNumber();

        if (studentNumber == null || studentNumber.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Account has no student number"
            );
        }

        return studentNumber;
    }

    private boolean isAdmin(Authentication authentication) {

        return authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN") ||
                                authority.getAuthority().equals("ADMIN")
                );
    }

    private void validateCreateRequest(ItemRequest request) {

        if (request == null ||
                request.getItemName() == null ||
                request.getItemName().isBlank() ||
                request.getType() == null ||
                request.getCategoryId() == null ||
                request.getLocationId() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Item name, type, category and location are required"
            );
        }
    }
}
