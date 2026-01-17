# Identity Verification Feature

This document outlines the implementation and usage of the Identity Verification feature in the Care Connect application.

## Overview

The Identity Verification feature allows Nannies to upload identity documents (like Aadhar, PAN, etc.) to verify their profile. This process aids in building trust within the platform. The feature includes:
- Document upload with validation (File type, ID Number, Phone, Address).
- Admin review process (Approve/Reject).
- Verification history (archiving of attempts).
- Reset functionality for users to restart the process.

## Data Model

### `users` Table Updates
- `identity_verification_status`: Tracks current status (`unverified`, `pending`, `verified`, `rejected`).
- `verification_rejection_reason`: Stores the reason if rejected.

### `identity_documents` Table
Stores current active documents.
- `user_id`: Reference to the user.
- `type`: Document type (e.g., AADHAR, PAN).
- `id_number`: Document ID number.
- `file_path`: Path to the uploaded file.
- `uploaded_at`: Timestamp.

### `verification_attempts` Table
Stores history of past verification attempts.
- `user_id`: Reference to the user.
- `archived_at`: When the attempt was archived (reset).
- `status`: Status at the time of archiving.
- `rejection_reason`: Reason if it was rejected.
- Includes fields from `identity_documents` (`type`, `id_number`, `file_path`).

## API Endpoints

### 1. Upload Documents
**POST** `/verification/upload`
- **Auth**: Required (JWT)
- **Content-Type**: `multipart/form-data`
- **Payload**:
  - `file`: The document file (PDF, JPG, PNG).
  - `idType`: Type of ID.
  - `idNumber`: ID Number (max 50 chars).
  - `phone`: User's phone number (Indian mobile number format, starts with 6-9, 10 digits).
  - `address`: User's address (min 10 chars).

### 2. Get Pending Verifications (Admin)
**GET** `/verification/pending`
- **Auth**: Required (JWT)
- **Response**: List of users with pending verification status, including their documents and profile info.

### 3. Approve Verification (Admin)
**POST** `/verification/:id/approve`
- **Auth**: Required (JWT)
- **Params**: `id` (User ID)
- **Effect**: Sets user status to `verified`.

### 4. Reject Verification (Admin)
**POST** `/verification/:id/reject`
- **Auth**: Required (JWT)
- **Params**: `id` (User ID)
- **Body**: `{ "reason": "string" }`
- **Effect**: Sets user status to `rejected` and saves the reason.

### 5. Reset Verification (User)
**DELETE** `/verification/reset`
- **Auth**: Required (JWT)
- **Effect**:
  - Archives current documents to `verification_attempts`.
  - Deletes current documents from `identity_documents`.
  - Resets user status to `null` (unverified).
  - Clears rejection reason.

## Frontend Integration Notes
- ensure to use `phone` field name for phone number in the upload form.
- The Reset endpoint (`DELETE /verification/reset`) should be called when a user wants to re-upload documents after rejection or if they want to cancel a pending request.
