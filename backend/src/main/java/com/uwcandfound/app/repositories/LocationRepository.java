package com.uwcandfound.app.repositories;
 
import org.springframework.data.jpa.repository.JpaRepository;
 
import com.uwcandfound.app.models.Locations;
 
// JpaRepository<Entity, IdType>: Spring writes findAll, findById, save and
// delete for you. Nothing else is needed for the location dropdown.
public interface LocationRepository extends JpaRepository<Locations, Long> {
}
 
