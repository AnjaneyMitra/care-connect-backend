# API Reference Guide

This document provides a comprehensive reference for the Care Connect Backend API.

## General Information

- **Base URL**: `http://localhost:3000` (Local Development)
- **API Version**: v1
- **Content-Type**: `application/json`

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
        "profile": { ... },
        "nanny_details": { ... },
        "distance": number
      }
    ]
  }
  ```

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
        "location_lat": number,
        "location_lng": number,
        "distance": number,
        ...
      }
    ]
  }
  ```

## Error Responses

Standard error format:
```json
{
  "statusCode": number,
  "message": "string" | ["string"],
  "error": "string"
}
```
