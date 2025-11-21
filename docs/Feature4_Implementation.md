# Feature 4: Service Request & Auto-Matching System - Implementation Guide

This document outlines the implementation details of Feature 4 (Service Request & Auto-Matching System) for the Care Connect platform. It is intended for frontend developers and other team members to understand how to interact with the backend and how the matching logic works.

## 1. Overview

The Service Request & Auto-Matching System allows parents to create service requests for nannies. The system automatically finds the best-matched nanny based on location, availability, skills, and rating, and assigns the request to them.

## 2. API Endpoints

Base URL: `/requests`
Auth Guard: `JwtAuthGuard` (Requires valid Bearer token)

### 2.1 Create Service Request

**POST** `/requests`

Creates a new service request and immediately triggers the auto-matching algorithm.

**Request Body (`CreateRequestDto`):**

```json
{
  "date": "2023-12-25", // Required. Format: YYYY-MM-DD
  "start_time": "14:30:00", // Required. Format: HH:MM:SS
  "duration_hours": 4, // Required. Number (0.5 - 24)
  "num_children": 2, // Required. Integer (1 - 10)
  "children_ages": [3, 5], // Optional. Array of integers
  "special_requirements": "None", // Optional. String
  "required_skills": ["CPR", "First Aid"], // Optional. Array of strings
  "max_hourly_rate": 25.0 // Optional. Number
}
```

**Response:**
Returns the created `service_request` object. If a match is found immediately, the status might be `assigned`. If no match is found, it might be `no_matches`.

### 2.2 Get Request Details

**GET** `/requests/:id`

Retrieves full details of a specific request, including its current assignments and status.

### 2.3 Get Parent's Requests

**GET** `/requests/parent/me`

Retrieves all requests created by the authenticated parent, ordered by creation date (newest first).

### 2.4 Cancel Request

**PUT** `/requests/:id/cancel`

Cancels a pending or assigned request.
**Restrictions:** Can only cancel if status is `pending`, `assigned`, or `no_matches`.

### 2.5 View Matches (Transparency)

**GET** `/requests/:id/matches`

Returns a list of potential nanny matches for a request, including their scores and details. Useful for debugging or showing parents who is nearby.

## 3. The Auto-Matching Algorithm

The matching logic is implemented in `RequestsService.triggerMatching`. It runs automatically when a request is created.

### 3.1 Search Criteria

1.  **Radius**: Finds nannies within **10 km** of the parent's profile location.
2.  **Role**: Users with role `nanny`.
3.  **Verification**: Nanny must be verified (`is_verified = true`).
4.  **Availability**: Nanny must be marked as "available now" (`is_available_now = true`).
5.  **Exclusions**: Nannies who have already rejected this request or timed out are excluded.

### 3.2 Filtering

Candidates are further filtered by:

- **Hourly Rate**: Must be <= `max_hourly_rate` (if specified by parent).
- **Skills**: Must possess ALL `required_skills` (case-insensitive match).
- **Schedule**: Must be available for the specific day and time slot requested (checked against `availability_schedule` JSON).

### 3.3 Scoring & Ranking

Candidates are scored (0-100) and ranked based on a weighted composite score:

| Factor       | Weight | Logic                                                             |
| :----------- | :----- | :---------------------------------------------------------------- |
| **Distance** | 40%    | Closer is better. 0km = 100 pts, 10km = 0 pts.                    |
| **Rating**   | 30%    | Higher is better. 5 stars = 100 pts.                              |
| **Rate**     | 30%    | Lower rate is better. Matches max rate = 50 pts, lower = >50 pts. |

### 3.4 Assignment

- The system picks the **top-ranked** candidate.
- A new `assignment` record is created with status `pending`.
- The request status updates to `assigned`.
- **Timeout**: The nanny has **15 minutes** to respond (set in `response_deadline`).

## 4. Request Lifecycle (State Machine)

The `status` field of a service request transitions as follows:

- `pending`: Initial state, or waiting for a match.
- `assigned`: A nanny has been selected and notified.
- `accepted`: The nanny accepted the assignment.
- `in_progress`: Service has started.
- `completed`: Service is finished.
- `cancelled`: Request was cancelled by parent or system.
- `no_matches`: No suitable nannies were found.

**Valid Transitions:**

- `pending` → `assigned`, `cancelled`, `no_matches`
- `assigned` → `accepted`, `pending` (if rejected/timeout), `cancelled`
- `accepted` → `in_progress`, `cancelled`
- `in_progress` → `completed`, `cancelled`

## 5. Frontend Integration Guidelines

1.  **Date & Time Handling**:
    - Ensure `date` is sent as `YYYY-MM-DD`.
    - Ensure `start_time` is sent as `HH:MM:SS` (24-hour format).
    - The backend stores `start_time` on a dummy date (1970-01-01), so rely on the time component only.

2.  **Location**:
    - The backend uses the **Parent's Profile Location** (`lat`, `lng`) automatically.
    - **Pre-requisite**: The parent MUST have a profile with a valid address/location before creating a request. Handle the 400 error "Parent profile incomplete" by redirecting the user to their profile settings.

3.  **Polling vs. Real-time**:
    - Currently, the API returns the request state immediately after creation.
    - To track status changes (e.g., when a nanny accepts), the frontend should poll `GET /requests/:id` or listen for WebSocket events (if/when implemented in the Notification module).

4.  **Error Handling**:
    - **400 Bad Request**: Invalid input or invalid status transition (e.g., trying to cancel a completed job).
    - **404 Not Found**: Request ID does not exist.
