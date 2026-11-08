package com.uwcandfound.app.request;

import com.uwcandfound.app.models.Item;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItemRequest {
    private String studentNumber;
    private Item.Type type;
    private String itemName;
    private String description;
    private Long categoryId;
    private Long locationId;
    private String locationDetails;
    private Date dateOccurred;
    private Item.Status status;
}
