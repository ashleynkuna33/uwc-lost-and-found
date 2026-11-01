package com.uwcandfound.app.services.Categories;

import com.uwcandfound.app.exceptions.DuplicateResourceException;
import com.uwcandfound.app.exceptions.ResourceNotFoundException;
import com.uwcandfound.app.models.Categories;
import com.uwcandfound.app.models.User;
import com.uwcandfound.app.repositories.CategoriesRepository;
import com.uwcandfound.app.repositories.UserRepository;
import com.uwcandfound.app.request.category.CategoryRequest;
import com.uwcandfound.app.request.category.CategoryResponse;
import lombok.AllArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class CategoriesService implements ICategories {

    private final CategoriesRepository categoriesRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoriesRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Categories category = categoriesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return toResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        requireAdmin();

        String name = request.getName().trim();

//        confirm the category name is new on the system
        if (categoriesRepository.existsByNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Category already exists: " + name);
        }

        Categories category = new Categories();
        category.setName(name);

        Categories saved = categoriesRepository.save(category);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(CategoryRequest request, Long id) {
        requireAdmin();

//        confirm the category exists and fetch it
        Categories category = categoriesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        String name = request.getName().trim();

//        another category must not already use this name (the category itself is excluded)
        if (categoriesRepository.existsByNameIgnoreCaseAndCategoriesIdNot(name, id)) {
            throw new DuplicateResourceException("Category already exists: " + name);
        }

        category.setName(name);
        Categories saved = categoriesRepository.save(category);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        requireAdmin();

        Categories category = categoriesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        try {
            categoriesRepository.delete(category);
//            flush sends the DELETE to MySQL now, so a foreign key error is caught here
            categoriesRepository.flush();
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
//            reports still point to this category
            throw new DuplicateResourceException(
                    "Cannot delete category '" + category.getName() + "' because reports are still using it");
        }
    }

//    the JWT filter does not give users roles, so we read the role from the database
    private void requireAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new AccessDeniedException("You must be logged in");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("You must be logged in"));

        if (user.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("Only administrators can manage categories");
        }
    }

    private CategoryResponse toResponse(Categories category) {
        return new CategoryResponse(category.getCategoriesId(), category.getName());
    }
}
