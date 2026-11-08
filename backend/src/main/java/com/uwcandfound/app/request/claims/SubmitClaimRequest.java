package com.uwcandfound.app.request.claims;

public record SubmitClaimRequest(
        Long itemId,
        String explanation
) {}
