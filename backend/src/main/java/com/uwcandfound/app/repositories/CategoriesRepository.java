package com.uwcandfound.app.repositories;

import com.uwcandfound.app.models.Categories;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoriesRepository extends JpaRepository<Categories, Long> {

    Optional<Categories> findById(long id);

    // Used when creating a category, to reject duplicate names
    boolean existsByNameIgnoreCase(String name);
    boolean existsByName(String name);
    boolean existsById(Long id);

    // Used when updating a category, so renaming it to its own name isn't flagged as a duplicate
    boolean existsByNameIgnoreCaseAndCategoriesIdNot(String name, Long categoriesId);

    Optional<Categories> findByName(String name);
}
