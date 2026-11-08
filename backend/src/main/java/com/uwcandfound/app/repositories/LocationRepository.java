package com.uwcandfound.app.repositories;
 
import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
 
import com.uwcandfound.app.models.Locations;

import java.util.Optional;

// JpaRepository<Entity, IdType>: Spring writes findAll, findById, save and
// delete for you. Nothing else is needed for the location dropdown.
public interface LocationRepository extends JpaRepository<Locations, Long> {
    Optional<Locations> findById(long id);
    boolean existsById(@NonNull Long id);
}
 
