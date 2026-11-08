
package com.uwcandfound.app.controller;

import com.uwcandfound.app.models.Item;
import com.uwcandfound.app.request.ItemRequest;
import com.uwcandfound.app.request.ItemResponse;
import com.uwcandfound.app.services.Item.IItem;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/items")
@RequiredArgsConstructor
public class ItemController {

    private final IItem itemService;

    @GetMapping
    public ResponseEntity<List<ItemResponse>> getItems() {

        return ResponseEntity.ok(
                itemService.getItems()
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Item>> getItemsByStatus(
            @PathVariable String status
    ) {

        List<Item> items =
                itemService.getItemsByStatus(status);

        return ResponseEntity.ok(items);
    }

    @GetMapping("/search")
    public ResponseEntity<Item> findItemByName(
            @RequestParam String name
    ) {

        Item item = itemService.findItemByName(name);

        return ResponseEntity.ok(item);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> findItem(
            @PathVariable Long id
    ) {

        Item item = itemService.findItem(id);

        return ResponseEntity.ok(item);
    }

    @PostMapping
    public ResponseEntity<Item> createItem(
            @Valid @RequestBody ItemRequest request
    ) {

        Item item = itemService.createItem(request);

        URI location = URI.create(
                "/api/v1/items/" + item.getId()
        );

        return ResponseEntity
                .created(location)
                .body(item);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Item> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody ItemRequest request
    ) {

        Item updatedItem =
                itemService.updateItem(id, request);

        return ResponseEntity.ok(updatedItem);
    }
}
