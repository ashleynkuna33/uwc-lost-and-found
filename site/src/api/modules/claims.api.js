
import { apiClient } from "../clients";
import { ENDPOINTS } from "../endpoints";

export const claimsApi = {

  // =====================================================
  // STUDENT OPERATIONS
  // =====================================================

  // POST /api/v1/claims
  // Submit a claim for a found item
  submit: (itemId, explanation) =>
    apiClient.post(ENDPOINTS.CLAIMS.BASE, {
      itemId,
      explanation,
    }),

  // GET /api/v1/claims/my
  // Retrieve claims submitted by the logged-in student
  getMine: () =>
    apiClient.get(ENDPOINTS.CLAIMS.MY),

  // GET /api/v1/claims/{claimId}
  // Retrieve a specific claim
  getById: (claimId) =>
    apiClient.get(ENDPOINTS.CLAIMS.BY_ID(claimId)),

  // =====================================================
  // ADMINISTRATOR OPERATIONS
  // =====================================================

  // GET /api/v1/claims
  // Retrieve all claims (ADMIN only)
  getAll: () =>
    apiClient.get(ENDPOINTS.CLAIMS.BASE),

  // PATCH /api/v1/claims/{claimId}/review
  // Approve or reject a claim
  review: (claimId, decision, adminNotes = "") =>
    apiClient.patch(
      ENDPOINTS.CLAIMS.REVIEW(claimId),
      {
        decision: decision.toLowerCase(),
        adminNotes,
      }
    ),

  // =====================================================
  // CLAIM EVIDENCE OPERATIONS
  // =====================================================

  // POST /api/v1/claims/{claimId}/evidence
  // Submit text evidence for a pending claim
  submitTextEvidence: (claimId, description) =>
    apiClient.post(
      ENDPOINTS.CLAIMS.EVIDENCE(claimId),
      {
        evidenceType: "TEXT",
        description,
      }
    ),

  // GET /api/v1/claims/{claimId}/evidence
  // Retrieve evidence associated with a claim
  getEvidence: (claimId) =>
    apiClient.get(
      ENDPOINTS.CLAIMS.EVIDENCE(claimId)
    ),

};
