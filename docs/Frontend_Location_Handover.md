# Frontend Location Features Handover

This document outlines the location-based features available in the backend and provides a guide for the frontend team to integrate them.

## Overview

The backend provides functionality for:

1.  **Geocoding**: Converting addresses to coordinates (Latitude/Longitude).
2.  **Nearby Search**: Finding nannies and jobs within a specified radius of a location.
3.  **Distance Calculation**: Calculating distances between users/jobs and the search location.

## API Endpoints

### 1. Geocode Address

Converts a human-readable address into coordinates.

- **Endpoint**: `POST /location/geocode`
- **Body**:
  ```json
  {
    "address": "123 Main St, New York, NY"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "lat": 40.712776,
      "lng": -74.005974
    }
  }
  ```
- **Error Response**:
  ```json
  {
    "success": false,
    "message": "Could not geocode the provided address"
  }
  ```

### 2. Find Nearby Nannies

Finds nannies within a specific radius of a given location.

- **Endpoint**: `GET /location/nannies/nearby`
- **Query Parameters**:
  - `lat` (required): Latitude of the center point.
  - `lng` (required): Longitude of the center point.
  - `radius` (optional): Search radius in kilometers (default: 10).
- **Example**: `/location/nannies/nearby?lat=40.7128&lng=-74.0060&radius=15`
- **Response**:
  ```json
  {
    "success": true,
    "count": 5,
    "radius": "15km",
    "data": [
      {
        "id": "user-uuid",
        "email": "nanny@example.com",
        "profile": {
          "first_name": "Jane",
          "last_name": "Doe",
          "phone": "555-0123",
          "address": "123 Main St",
          "lat": "40.7128",
          "lng": "-74.0060",
          "profile_image_url": "https://..."
        },
        "nanny_details": {
          "skills": ["CPR", "First Aid"],
          "experience_years": 5,
          "hourly_rate": "25.00",
          "bio": "Experienced nanny..."
        },
        "distance": 0.5 // Distance in km
      }
    ]
  }
  ```

### 3. Find Nearby Jobs

Finds open jobs within a specific radius of a given location.

- **Endpoint**: `GET /location/jobs/nearby`
- **Query Parameters**:
  - `lat` (required): Latitude.
  - `lng` (required): Longitude.
  - `radius` (optional): Radius in km (default: 10).
- **Response**:
  ```json
  {
    "success": true,
    "count": 3,
    "radius": "10km",
    "data": [
      {
        "id": "job-uuid",
        "title": "Nanny needed for 2 kids",
        "description": "...",
        "date": "2023-12-01T00:00:00.000Z",
        "time": "2023-12-01T14:00:00.000Z",
        "location_lat": "40.7130",
        "location_lng": "-74.0070",
        "status": "open",
        "parent": {
          "email": "parent@example.com",
          "profiles": { "first_name": "John", "last_name": "Doe" }
        },
        "distance": 1.2
      }
    ]
  }
  ```

## Integration Guide

### User Location Updates

When a user updates their address in their profile:

1.  **Geocode First**: The frontend **MUST** call `POST /location/geocode` with the entered address to get `lat` and `lng`.
2.  **Update Profile**: Include `lat`, `lng`, and `address` in the `PUT /users/:id` request.
    - _Note_: The backend does **not** automatically geocode the address if only the address string is provided. It **does** attempt to reverse-geocode (get address from coordinates) if only `lat`/`lng` are provided, but for accuracy, it is best to send all three.

### Search Functionality

1.  **Get User Location**: Use the browser's Geolocation API or allow the user to enter an address (and geocode it) to get the search center (`lat`, `lng`).
2.  **Call API**: Use the coordinates to call `GET /location/nannies/nearby` or `GET /location/jobs/nearby`.
3.  **Display Results**: The results include a `distance` field, which can be displayed to the user (e.g., "2.5 km away").

    > [!NOTE]
    > **No Client-Side Filtering Needed**: The API returns results that are **already filtered** by the specified radius and **sorted** by distance (closest first). You do not need to perform any distance calculations or filtering on the frontend.

## Data Types

### Coordinates

```typescript
interface Coordinates {
  lat: number;
  lng: number;
}
```

### NearbyNanny

```typescript
interface NearbyNanny {
  id: string;
  email: string;
  profile: {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    address: string | null;
    lat: number | null;
    lng: number | null;
    profile_image_url: string | null;
  } | null;
  nanny_details: {
    skills: string[];
    experience_years: number | null;
    hourly_rate: number | null;
    bio: string | null;
  } | null;
  distance: number;
}
```
