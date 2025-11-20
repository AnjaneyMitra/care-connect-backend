# API Reference Guide

This document provides a comprehensive reference for the Care Connect Backend API.

## General Information

- **Base URL**: `http://localhost:4000` (Local Development)
- **Frontend URL**: `http://localhost:3000` (Next.js)
- **API Version**: v1
- **Content-Type**: `application/json`
- **CORS**: Enabled for `http://localhost:3000` by default

## Authentication

> **Note**: Authentication is currently in development. For now, endpoints are public or use mock authentication.

- **Method**: JWT (JSON Web Tokens)
- **Header**: `Authorization: Bearer <token>`

## Endpoints

### Users

#### GET /users/me
Retrieve the current user's profile.

- **Authentication**: Required
- **Response**: `User` object

#### GET /users/:id
Retrieve a specific user's profile by ID.

- **Path Parameters**:
  - `id` (string): User UUID
- **Response**: `User` object

#### PUT /users/:id
Update a user's profile.

- **Path Parameters**:
  - `id` (string): User UUID
- **Request Body**: `UpdateUserDto`
- **Response**: Updated `User` object

#### POST /users/upload-image
Upload a profile image (currently accepts URL string).

- **Request Body**:
  ```json
  {
    "userId": "string",
    "imageUrl": "string"
  }
  ```
- **Response**: Updated `User` object

### Location

#### POST /location/geocode
Convert an address to coordinates.

- **Request Body**:
  ```json
  {
    "address": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "lat": number,
      "lng": number
    }
  }
  ```

#### GET /location/nannies/nearby
Find nannies within a specified radius.

- **Query Parameters**:
  - `lat` (number, required): Latitude
  - `lng` (number, required): Longitude
  - `radius` (number, optional): Radius in km (default: 10)
- **Response**:
  ```json
  {
    "success": true,
    "count": number,
    "radius": "string",
    "data": [
      {
        "id": "string",
        "email": "string",
        "role": "nanny",
        "profile": {
          "user_id": "string",
          "first_name": "string",
          "last_name": "string",
          "phone": "string",
          "address": "string",
          "lat": "string",
          "lng": "string",
          "profile_image_url": "string | null",
          "created_at": "string",
          "updated_at": "string"
        },
        "nanny_details": {
          "user_id": "string",
          "skills": ["string"],
          "experience_years": number,
          "hourly_rate": "string",
          "bio": "string",
          "availability_schedule": {
            "monday": ["09:00-17:00"],
            "tuesday": ["09:00-17:00"]
          },
          "created_at": "string",
          "updated_at": "string"
        },
        "distance": number
      }
    ]
  }
  ```
  
  **Note**: Sensitive fields like `password_hash`, `oauth_access_token`, and verification tokens are excluded from responses.

#### GET /location/jobs/nearby
Find jobs within a specified radius.

- **Query Parameters**:
  - `lat` (number, required): Latitude
  - `lng` (number, required): Longitude
  - `radius` (number, optional): Radius in km (default: 10)
- **Response**:
  ```json
  {
    "success": true,
    "count": number,
    "radius": "string",
    "data": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "date": "string",
        "time": "string",
        "location_lat": "string",
        "location_lng": "string",
        "status": "open",
        "parent": {
          "id": "string",
          "email": "string",
          "role": "parent",
          "profiles": {
            "first_name": "string",
            "last_name": "string"
          }
        },
        "distance": number
      }
    ]
  }
  ```
  
  **Note**: Only non-sensitive parent information is included.

## Error Responses

Standard error format:
```json
{
  "statusCode": number,
  "message": "string" | ["string"],
  "error": "string"
}
```
