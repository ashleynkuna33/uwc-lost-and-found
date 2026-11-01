package com.uwcandfound.app.services.Categories;

import com.uwcandfound.app.request.category.CategoryRequest;
import com.uwcandfound.app.request.category.CategoryResponse;


import java.util.List;

public interface ICategories {
//    any logged-in user can view categories (needed for dropdowns and filters)
    List<CategoryResponse> getAllCategories();
    CategoryResponse getCategoryById(Long id);

//    only an admin can create, update or delete categories
    CategoryResponse createCategory(CategoryRequest request);
    CategoryResponse updateCategory(CategoryRequest request, Long id);
    void deleteCategory(Long id);
}
