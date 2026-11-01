package com.uwcandfound.app.request.claims;

/* Carries the item ID and student's ownership explanation from the frontend. */
public class SubmitClaimRequest {
    private Long itemId;
    private String explanation;

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}