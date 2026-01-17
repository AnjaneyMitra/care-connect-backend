# Verification Resubmission Feature

## Overview
This feature allows nannies who have submitted an identity verification request to **withdraw** their current application and submit a new one. This is useful if they realized they made a mistake in the form (e.g., wrong document type, incorrect ID number, or poor image quality) while the request is still in the "Pending" state.

## Frontend Implementation

### User Flow
1.  **Pending State**: When a user visits `/nanny/verification` and their status is `pending`, they will see their current status card.
2.  **Withdraw Action**: Below the status card, a "Withdraw and Submit New Application" button is displayed.
3.  **Confirmation**: Clicking the button triggers a confirmation dialog ("Are you sure? This will delete your current submission.").
4.  **Reset**: Upon confirmation, the frontend calls the `DELETE /verification/reset` endpoint.
5.  **Refresh**: On success (200 OK), the page reloads. The user is then presented with the **Verification Upload Form** again, as if they were a new applicant.

### Components Modified
*   `src/app/nanny/verification/page.tsx`: Added the reset button logic and UI in the pending state view.
*   `src/lib/api.ts`: Added the `reset` method to the verification API client.

## Backend Implementation Logic (Required)

To support the "Withdraw" feature, the backend MUST implement the `DELETE /verification/reset` endpoint with the following strict logic:

### Endpoint: `DELETE /verification/reset`

**Authentication**:
-   User must be authenticated.
-   User role must be `'nanny'`.

**Transaction Steps**:
1.  **Fetch Current Verification**:
    -   Find the currently logged-in user.
    -   Check if they have existing `IdentityDocument` records or a pending `identity_verification_status`.

2.  **Archive / Audit (Critical)**:
    -   **DO NOT** simply delete the data. We must maintain an audit trail.
    -   Move existing `IdentityDocument` rows to an archival table (e.g., `identity_documents_history` or `archived_verifications`).
    -   Include a `withdrawal_reason` (e.g., "User Withdrew Application") and `withdrawn_at` timestamp.

3.  **Reset User State**:
    -   Delete the *active* `IdentityDocument` records for this user (so `user.identity_documents` becomes empty).
    -   Update the `User` record:
        -   Set `identity_verification_status` to `'unverified'` (or `null` / empty string, depending on your enum default). **Crucial**: It must NOT be 'pending', 'verified', or 'rejected'.
        -   Set `verification_rejection_reason` to `null`.
        -   Set `is_verified` to `false`.

4.  **File Cleanup (Optional but Recommended)**:
    -   The actual files in object storage (S3/Cloudinary) can either be deleted or moved to a "cold storage" / "archived" path to save costs, but keeping them is safer for audit.

5.  **Return Success**:
    -   Return HTTP `200 OK`.
    -   Body: `{ "success": true, "message": "Application withdrawn successfully" }`.

**Why this is needed**:
The frontend relies on `identity_verification_status` being reset to its initial state to trigger the display of the **Upload Form**. If the backend leaves the status as 'pending' or doesn't clear the documents, the frontend will mistakenly show the "Pending" screen again.
