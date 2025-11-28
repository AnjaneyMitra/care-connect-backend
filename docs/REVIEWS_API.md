# Reviews & Ratings API Documentation

## Overview
This document provides complete API documentation for the Reviews & Ratings feature. The reviews system allows parents and nannies to rate and review each other after completing a booking.

**Base URL**: `http://localhost:4000`  
**Authentication**: Bearer Token required for write operations and eligibility checks.

---

## Endpoints

### 1. Create Review
**POST** `/reviews`

Create a new review for a completed booking.

**Authentication**: ✅ Required

**Request Body**:
```json
{
  "bookingId": "uuid-string",
  "rating": 5,
  "comment": "Excellent caregiver!"
}
```

**Validation Rules**:
- `bookingId`: Required, must be a valid UUID
- `rating`: Required, integer between 1-5
- `comment`: Optional, max 1000 characters

**Response** (201 Created):
```json
{
  "id": "review-uuid",
  "booking_id": "booking-uuid",
  "reviewer_id": "user-uuid",
  "reviewee_id": "user-uuid",
  "rating": 5,
  "comment": "Excellent caregiver!",
  "created_at": "2025-11-28T14:21:00.000Z",
  "users_reviews_reviewee_idTousers": {
    "id": "user-uuid",
    "role": "nanny",
    "profiles": {
      "first_name": "Jane",
      "last_name": "Doe",
      "profile_image_url": "https://example.com/image.jpg"
    }
  }
}
```

**Business Rules**:
- Booking must have status `COMPLETED`
- User must be part of the booking (parent or nanny)
- User can only review once per booking
- Reviewee is automatically determined (the other party in the booking)

**Error Responses**:
- `400 Bad Request`: Booking not completed, already reviewed, or user not part of booking
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Booking doesn't exist

---

### 2. Update Review
**PATCH** `/reviews/:id`

Update an existing review's rating or comment.

**Authentication**: ✅ Required

**URL Parameters**:
- `id`: Review UUID

**Request Body**:
```json
{
  "rating": 4,
  "comment": "Updated comment"
}
```

**Validation Rules**:
- `rating`: Optional, integer between 1-5
- `comment`: Optional, max 1000 characters
- Cannot update `bookingId`

**Response** (200 OK):
```json
{
  "id": "review-uuid",
  "booking_id": "booking-uuid",
  "reviewer_id": "user-uuid",
  "reviewee_id": "user-uuid",
  "rating": 4,
  "comment": "Updated comment",
  "created_at": "2025-11-28T14:21:00.000Z",
  "users_reviews_reviewee_idTousers": {
    "id": "user-uuid",
    "role": "nanny",
    "profiles": {
      "first_name": "Jane",
      "last_name": "Doe",
      "profile_image_url": "https://example.com/image.jpg"
    }
  }
}
```

**Business Rules**:
- Only the reviewer can update their own review

**Error Responses**:
- `403 Forbidden`: User is not the reviewer
- `404 Not Found`: Review doesn't exist

---

### 3. Delete Review
**DELETE** `/reviews/:id`

Delete a review.

**Authentication**: ✅ Required

**URL Parameters**:
- `id`: Review UUID

**Response** (200 OK):
```json
{
  "message": "Review deleted successfully"
}
```

**Business Rules**:
- Only the reviewer can delete their own review

**Error Responses**:
- `403 Forbidden`: User is not the reviewer
- `404 Not Found`: Review doesn't exist

---

### 4. Get Reviews for User
**GET** `/reviews/user/:userId`

Get all reviews received by a specific user (as reviewee).

**Authentication**: ❌ Not Required (Public)

**URL Parameters**:
- `userId`: User UUID

**Response** (200 OK):
```json
[
  {
    "id": "review-uuid",
    "booking_id": "booking-uuid",
    "reviewer_id": "reviewer-uuid",
    "reviewee_id": "user-uuid",
    "rating": 5,
    "comment": "Great experience!",
    "created_at": "2025-11-28T14:21:00.000Z",
    "users_reviews_reviewer_idTousers": {
      "id": "reviewer-uuid",
      "role": "parent",
      "profiles": {
        "first_name": "John",
        "last_name": "Smith",
        "profile_image_url": "https://example.com/image.jpg"
      }
    },
    "bookings": {
      "id": "booking-uuid",
      "start_time": "2025-11-20T09:00:00.000Z",
      "end_time": "2025-11-20T17:00:00.000Z"
    }
  }
]
```

**Notes**:
- Results are ordered by `created_at` descending (newest first)
- Returns empty array if no reviews found

---

### 5. Get Reviews for Nanny
**GET** `/reviews/nanny/:nannyId`

Get all reviews for a specific nanny. Validates that the user is actually a nanny.

**Authentication**: ❌ Not Required (Public)

**URL Parameters**:
- `nannyId`: Nanny's user UUID

**Response**: Same as "Get Reviews for User"

**Error Responses**:
- `400 Bad Request`: User is not a nanny
- `404 Not Found`: User doesn't exist

---

### 6. Get Reviews for Parent
**GET** `/reviews/parent/:parentId`

Get all reviews for a specific parent. Validates that the user is actually a parent.

**Authentication**: ❌ Not Required (Public)

**URL Parameters**:
- `parentId`: Parent's user UUID

**Response**: Same as "Get Reviews for User"

**Error Responses**:
- `400 Bad Request`: User is not a parent
- `404 Not Found`: User doesn't exist

---

### 7. Get Reviews for Booking
**GET** `/reviews/booking/:bookingId`

Get all reviews associated with a specific booking (maximum 2: one from parent, one from nanny).

**Authentication**: ❌ Not Required (Public)

**URL Parameters**:
- `bookingId`: Booking UUID

**Response** (200 OK):
```json
[
  {
    "id": "review-uuid-1",
    "booking_id": "booking-uuid",
    "reviewer_id": "parent-uuid",
    "reviewee_id": "nanny-uuid",
    "rating": 5,
    "comment": "Excellent service!",
    "created_at": "2025-11-28T14:21:00.000Z",
    "users_reviews_reviewer_idTousers": {
      "id": "parent-uuid",
      "role": "parent",
      "profiles": {
        "first_name": "John",
        "last_name": "Smith",
        "profile_image_url": "https://example.com/image.jpg"
      }
    },
    "users_reviews_reviewee_idTousers": {
      "id": "nanny-uuid",
      "role": "nanny",
      "profiles": {
        "first_name": "Jane",
        "last_name": "Doe"
      }
    }
  },
  {
    "id": "review-uuid-2",
    "booking_id": "booking-uuid",
    "reviewer_id": "nanny-uuid",
    "reviewee_id": "parent-uuid",
    "rating": 4,
    "comment": "Great family to work with!",
    "created_at": "2025-11-28T15:30:00.000Z",
    "users_reviews_reviewer_idTousers": {
      "id": "nanny-uuid",
      "role": "nanny",
      "profiles": {
        "first_name": "Jane",
        "last_name": "Doe",
        "profile_image_url": "https://example.com/image2.jpg"
      }
    },
    "users_reviews_reviewee_idTousers": {
      "id": "parent-uuid",
      "role": "parent",
      "profiles": {
        "first_name": "John",
        "last_name": "Smith"
      }
    }
  }
]
```

**Notes**:
- Returns empty array if no reviews exist for the booking
- Maximum 2 reviews per booking (one from each party)

---

### 8. Check Review Eligibility
**GET** `/reviews/booking/:bookingId/can-review`

Check if the current authenticated user can review a specific booking.

**Authentication**: ✅ Required

**URL Parameters**:
- `bookingId`: Booking UUID

**Response** (200 OK) - Can Review:
```json
{
  "canReview": true,
  "reason": null
}
```

**Response** (200 OK) - Cannot Review:
```json
{
  "canReview": false,
  "reason": "Booking must be completed before reviewing"
}
```

**Response** (200 OK) - Already Reviewed:
```json
{
  "canReview": false,
  "reason": "You have already reviewed this booking",
  "existingReview": {
    "id": "review-uuid",
    "rating": 5,
    "comment": "Great!",
    "created_at": "2025-11-28T14:21:00.000Z"
  }
}
```

**Possible Reasons**:
- `"You are not part of this booking"`
- `"Booking must be completed before reviewing"`
- `"You have already reviewed this booking"`

**Error Responses**:
- `404 Not Found`: Booking doesn't exist

---

## Average Rating Integration

The average rating for users (especially nannies) is **automatically calculated** and included in User API responses. You do **not** need to calculate it manually from the reviews list.

### Get User with Average Rating
**GET** `/users/:id`

Returns user details with `averageRating` and `totalReviews` fields (for nannies).

**Response** (200 OK):
```json
{
  "id": "user-uuid",
  "email": "nanny@example.com",
  "role": "nanny",
  "profiles": {
    "first_name": "Jane",
    "last_name": "Doe",
    "profile_image_url": "https://example.com/image.jpg"
  },
  "nanny_details": {
    "hourly_rate": 25,
    "experience_years": 5,
    "skills": ["CPR", "First Aid"]
  },
  "averageRating": 4.7,
  "totalReviews": 12
}
```

### Get All Nannies with Ratings
**GET** `/users/nannies`

Returns all nannies with their average ratings.

**Response**: Array of user objects (same structure as above)

**Notes**:
- `averageRating` is rounded to 1 decimal place
- `averageRating` is `null` if the user has no reviews
- `totalReviews` is always a number (0 if no reviews)

---

## TypeScript Interfaces

```typescript
export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number; // Integer 1-5
  comment: string | null;
  created_at: string; // ISO Date String

  // The person who WROTE the review
  users_reviews_reviewer_idTousers?: {
    id: string;
    role: "nanny" | "parent" | "admin";
    profiles: {
      first_name: string;
      last_name: string;
      profile_image_url: string | null;
    } | null;
  };

  // The person who RECEIVED the review
  users_reviews_reviewee_idTousers?: {
    id: string;
    role: "nanny" | "parent" | "admin";
    profiles: {
      first_name: string;
      last_name: string;
      profile_image_url: string | null;
    } | null;
  };

  // The booking details
  bookings?: {
    id: string;
    start_time: string;
    end_time: string;
  };
}

export interface CreateReviewDto {
  bookingId: string;
  rating: number; // 1-5
  comment?: string; // Max 1000 chars
}

export interface UpdateReviewDto {
  rating?: number; // 1-5
  comment?: string; // Max 1000 chars
}

export interface CanReviewResponse {
  canReview: boolean;
  reason: string | null;
  existingReview?: Review;
}
```

---

## Frontend Integration Examples

### Example 1: Display Reviews on Nanny Profile
```typescript
// Fetch nanny profile with average rating
const nanny = await fetch(`/users/${nannyId}`).then(r => r.json());

// Display: "⭐ 4.7 (12 reviews)"
console.log(`⭐ ${nanny.averageRating} (${nanny.totalReviews} reviews)`);

// Fetch individual reviews
const reviews = await fetch(`/reviews/nanny/${nannyId}`).then(r => r.json());

reviews.forEach(review => {
  const reviewerName = review.users_reviews_reviewer_idTousers?.profiles?.first_name;
  console.log(`${reviewerName} rated ${review.rating}/5: ${review.comment}`);
});
```

### Example 2: Leave a Review After Booking
```typescript
// Check if user can review
const eligibility = await fetch(`/reviews/booking/${bookingId}/can-review`, {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

if (eligibility.canReview) {
  // Show review form
  const reviewData = {
    bookingId: bookingId,
    rating: 5,
    comment: "Great experience!"
  };

  await fetch('/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(reviewData)
  });
} else {
  // Show reason why they can't review
  console.log(eligibility.reason);
}
```

### Example 3: Edit a Review
```typescript
const updateData = {
  rating: 4,
  comment: "Updated my review"
};

await fetch(`/reviews/${reviewId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(updateData)
});
```

---

## Important Notes

1. **Property Names**: The Prisma relation properties have verbose names (e.g., `users_reviews_reviewer_idTousers`). These are auto-generated and must be used as-is in your frontend.

2. **Single Rating System**: The current implementation uses a single 1-5 star rating. Granular ratings (punctuality, professionalism, etc.) are not currently implemented.

3. **Booking Status**: Reviews can only be created for bookings with status `COMPLETED`.

4. **One Review Per User Per Booking**: Each user (parent or nanny) can only leave one review per booking, but a booking can have up to 2 reviews total (one from each party).

5. **Public vs Protected**: Read operations are generally public (anyone can view reviews), but write operations require authentication.

6. **Average Rating Calculation**: The backend automatically calculates and includes `averageRating` in User responses. You don't need to manually calculate it from the reviews array.
