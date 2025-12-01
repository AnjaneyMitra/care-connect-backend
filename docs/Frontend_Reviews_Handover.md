# Frontend Handover: Reviews Feature

This document outlines the backend implementation and frontend requirements for the Reviews feature.

## Overview

The Reviews feature allows users (Parents and Nannies) to review each other after a booking is completed. Reviews consist of a rating (1-5) and a comment.

## API Endpoints

### 1. Create a Review

- **Endpoint:** `POST /reviews`
- **Authentication:** Required (JWT)
- **Description:** Submit a review for a completed booking.
- **Request Body:**
  ```json
  {
    "bookingId": "string (UUID)",
    "rating": number (1-5),
    "comment": "string"
  }
  ```
- **Response:**
  - `201 Created`: Review successfully created. Returns the created review object.
  - `400 Bad Request`:
    - "Can only review completed bookings" (if booking status is not COMPLETED)
    - "User is not part of this booking" (if user is not the parent or nanny of the booking)
    - "You have already reviewed this booking" (duplicate review attempt)
  - `404 Not Found`: "Booking not found"

### 2. Get Reviews for a User

- **Endpoint:** `GET /reviews/user/:userId`
- **Authentication:** Public (or optional, depending on global config)
- **Description:** Fetch all reviews received by a specific user (e.g., to display on their public profile).
- **Response:** Array of review objects.
  ```json
  [
    {
      "id": "string",
      "booking_id": "string",
      "reviewer_id": "string",
      "reviewee_id": "string",
      "rating": 5,
      "comment": "Great experience!",
      "created_at": "ISO Date String",
      "users_reviews_reviewer_idTousers": {
        "id": "string",
        "profiles": {
          "first_name": "John",
          "last_name": "Doe",
          "profile_image_url": "url_to_image"
        }
      }
    }
  ]
  ```

### 3. Get Reviews for a Booking

- **Endpoint:** `GET /reviews/booking/:bookingId`
- **Authentication:** Public (or optional)
- **Description:** Fetch reviews associated with a specific booking.
- **Response:** Array of review objects (similar structure to above).

## Frontend Implementation Requirements

### UI Components

1.  **Review Submission Form (Modal or Page)**
    - **Trigger:** Should be accessible from the "Booking History" or "Booking Details" page, specifically for bookings with status `COMPLETED`.
    - **Visibility:**
      - Show "Leave a Review" button only if the user hasn't reviewed yet.
      - Hide or show "Review Submitted" if already reviewed.
    - **Fields:**
      - **Rating:** Star rating input (1-5 stars).
      - **Comment:** Text area for written feedback.
    - **Validation:** Both fields should be required.
    - **Error Handling:** Display error messages from the API (e.g., "Already reviewed").

2.  **User Reviews List (Profile Page)**
    - **Location:** User Profile (Public View).
    - **Content:** List of reviews received by the user.
    - **Item Details:**
      - Reviewer's Name and Profile Image.
      - Star Rating (visual representation).
      - Comment text.
      - Date of review (formatted).
    - **Empty State:** "No reviews yet."

### Integration Logic

- **State Management:**
  - When a review is successfully submitted, update the local state of the booking to reflect that a review has been given (to disable the button).
  - Invalidate/Refetch user reviews query when viewing a profile to ensure fresh data.

- **Types (TypeScript)**

  ```typescript
  export interface Review {
    id: string;
    bookingId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    comment: string;
    createdAt: string;
    reviewer?: {
      id: string;
      firstName: string;
      lastName: string;
      profileImageUrl?: string;
    };
  }

  export interface CreateReviewDto {
    bookingId: string;
    rating: number;
    comment: string;
  }
  ```

## Notes

- The backend automatically determines who is the reviewee based on the logged-in user (reviewer) and the booking participants.
- Ensure the `bookingId` passed to the API is valid and corresponds to a completed booking.
