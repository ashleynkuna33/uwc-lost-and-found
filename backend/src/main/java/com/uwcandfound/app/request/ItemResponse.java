
package com.uwcandfound.app.request;

import com.uwcandfound.app.models.Item;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

public record ItemResponse(
        Long id,
        String itemName,
        String description,
        Item.Type type,
        Item.Status status,
        String category,
        String location,
        String locationDetails,
        LocalDateTime dateOccurred,
        List<String> images
) {}
