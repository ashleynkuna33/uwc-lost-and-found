package com.uwcandfound.app.services.Item;

import com.uwcandfound.app.models.Item;
import com.uwcandfound.app.request.ItemRequest;
import com.uwcandfound.app.request.ItemResponse;

import java.util.List;

public interface IItem {
    List<ItemResponse> getItems();
    List<Item> getItemsByStatus(String status);
    Item createItem(ItemRequest request);
    Item updateItem(long id, ItemRequest request);
    Item findItem(Long id);
    Item findItemByName(String name);
}
