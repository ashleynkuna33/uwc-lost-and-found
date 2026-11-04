package com.uwcandfound.app.request;

// Shared clean-up for query parameters, so every search criteria class
// treats paging and search text the same way.
public final class QueryParams {

    public static final int DEFAULT_SIZE = 10;
    public static final int MAX_SIZE = 50;

    private QueryParams() {
    }

    // Missing or negative page becomes 0 (the first page).
    public static int page(Integer page) {
        return (page == null || page < 0) ? 0 : page;
    }

    // Missing or invalid size becomes 10, and nobody can ask for more than 50 rows.
    public static int size(Integer size) {
        return (size == null || size < 1) ? DEFAULT_SIZE : Math.min(size, MAX_SIZE);
    }

    // Blank search text becomes null, which means "no filter".
    public static String text(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}