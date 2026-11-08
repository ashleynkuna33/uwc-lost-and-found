
package com.uwcandfound.app.repositories;

import com.uwcandfound.app.models.Item;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    @Override
    @EntityGraph(attributePaths = {
            "itemImages",
            "category",
            "location"
    })
    List<Item> findAll();

    List<Item> findByStatus(Item.Status status);

    Optional<Item> findFirstByItemNameIgnoreCaseOrderByIdDesc(
            String itemName
    );
}
