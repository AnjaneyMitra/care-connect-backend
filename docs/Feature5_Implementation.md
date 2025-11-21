# Feature 5: Nanny Assignment Management

## Overview

This feature manages the lifecycle of assigning nannies to service requests. It handles the flow from a parent creating a request to a nanny accepting or rejecting it, including automated re-matching and timeout handling.

## Endpoints

### 1. Get My Assignments

Retrieves all assignments (past and present) for the authenticated nanny.

- **URL**: `/assignments/nanny/me`
- **Method**: `GET`
- **Auth Required**: Yes (Nanny)
- **Response**: Array of assignment objects, including nested `service_requests` and parent `users` details.

### 2. Get Pending Assignments

Retrieves only the assignments that are currently in `pending` status and require the nanny's response.

- **URL**: `/assignments/pending`
- **Method**: `GET`
- **Auth Required**: Yes (Nanny)
- **Response**: Array of pending assignment objects.

### 3. Get Assignment Details

Retrieves detailed information about a specific assignment.

- **URL**: `/assignments/:id`
- **Method**: `GET`
- **Auth Required**: Yes (Nanny)
- **Params**: `id` (Assignment UUID)
- **Response**: Assignment object with full details.

### 4. Accept Assignment

Accepts a pending assignment. This action confirms the booking and notifies the parent.

- **URL**: `/assignments/:id/accept`
- **Method**: `PUT`
- **Auth Required**: Yes (Nanny)
- **Params**: `id` (Assignment UUID)
- **Response**:
  ```json
  {
    "assignment": { ...updated assignment object... },
    "booking": { ...newly created booking object... }
  }
  ```
- **Side Effects**:
  - Updates assignment status to `accepted`.
  - Updates service request status to `accepted`.
  - Creates a new record in the `bookings` table.
  - Updates nanny's acceptance rate.
  - Sends a push notification to the parent.

### 5. Reject Assignment

Rejects a pending assignment. This action triggers the system to find the next best nanny.

- **URL**: `/assignments/:id/reject`
- **Method**: `PUT`
- **Auth Required**: Yes (Nanny)
- **Params**: `id` (Assignment UUID)
- **Body**:
  ```json
  {
    "reason": "Optional rejection reason"
  }
  ```
- **Response**: `{ "success": true }`
- **Side Effects**:
  - Updates assignment status to `rejected`.
  - Updates nanny's acceptance rate.
  - Triggers the matching algorithm to find the next available nanny.

## Background Processes

### Assignment Timeouts

A cron job runs every minute to check for pending assignments that have exceeded their `response_deadline` (currently set to 15 minutes).

- **Service**: `AssignmentsTaskService`
- **Action**:
  - Marks assignment status as `timeout`.
  - Triggers the matching algorithm to find the next available nanny.

## Data Model Changes

### `assignments` Table

- Links `service_requests` to `users` (nannies).
- Tracks `status` (pending, accepted, rejected, timeout).
- Stores `response_deadline` and `rejection_reason`.

### `bookings` Table

- Added `request_id` to link directly to `service_requests`.
- Now created automatically upon assignment acceptance.

### `nanny_details` Table

- `acceptance_rate`: Updated automatically based on the ratio of accepted vs. total responded assignments.
