# Feature 3: Location & Geo Matching

## Overview
This feature implements location-based services for the Care Connect platform, enabling users to find nearby nannies and jobs based on geographic coordinates.

## Features Implemented

### 1. **Geocoding Service**
- Convert addresses to latitude/longitude coordinates using Google Geocoding API
- Integrated with Google Maps Services

### 2. **Distance Calculation**
- Haversine formula implementation for accurate distance calculation
- Returns distances in kilometers
- Precision: 2 decimal places

### 3. **Nearby Nannies Search**
- Find verified nannies within a specified radius
- Default radius: 10km
- Maximum radius: 100km
- Results sorted by distance (closest first)
- Includes nanny profile and details

### 4. **Nearby Jobs Search**
- Find open jobs within a specified radius
- Default radius: 10km
- Maximum radius: 100km
- Results sorted by distance (closest first)
- Includes job details and parent information

## API Endpoints

### POST /location/geocode
Convert an address to geographic coordinates.

**Request Body:**
```json
{
  "address": "1600 Amphitheatre Parkway, Mountain View, CA"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lat": 37.4224764,
    "lng": -122.0842499
  }
}
```

### GET /location/nannies/nearby
Find nearby nannies within a specified radius.

**Query Parameters:**
- `lat` (required): Latitude (-90 to 90)
- `lng` (required): Longitude (-180 to 180)
- `radius` (optional): Search radius in kilometers (1-100, default: 10)

**Example Request:**
```
GET /location/nannies/nearby?lat=19.0596&lng=72.8295&radius=10
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "radius": "10km",
  "data": [
    {
      "id": "uuid",
      "email": "nanny@example.com",
      "profile": {
        "first_name": "Priya",
        "last_name": "Patel",
        "phone": "+919123456789",
        "address": "Andheri East, Mumbai, Maharashtra 400069",
        "lat": 19.1136,
        "lng": 72.8697
      },
      "nanny_details": {
        "skills": ["First Aid", "Cooking", "Hindi", "English"],
        "experience_years": 5,
        "hourly_rate": 300.00,
        "bio": "Experienced nanny with 5 years of childcare experience. Fluent in Hindi and English."
      },
      "distance": 6.23
    }
  ]
}
```

### GET /location/jobs/nearby
Find nearby jobs within a specified radius.

**Query Parameters:**
- `lat` (required): Latitude (-90 to 90)
- `lng` (required): Longitude (-180 to 180)
- `radius` (optional): Search radius in kilometers (1-100, default: 10)

**Example Request:**
```
GET /location/jobs/nearby?lat=19.0596&lng=72.8295&radius=25
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "radius": "25km",
  "data": [
    {
      "id": "uuid",
      "title": "Weekend Babysitting",
      "description": "Need a babysitter for Saturday evening. Two kids aged 3 and 5.",
      "date": "2025-12-01",
      "time": "18:00:00",
      "location_lat": 19.0760,
      "location_lng": 72.8263,
      "status": "open",
      "parent": {
        "email": "parent@example.com",
        "profiles": {
          "first_name": "Rajesh",
          "last_name": "Sharma"
        }
      },
      "distance": 1.95
    }
  ]
}
```

## Environment Variables

Add the following to your `.env` file:

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Getting a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Geocoding API**
4. Go to **Credentials** and create an API key
5. (Optional) Restrict the API key to only allow Geocoding API requests
6. Copy the API key to your `.env` file

## Database Schema

The feature uses existing location fields in the database:

### profiles table
- `lat`: Decimal(10, 8) - User's latitude
- `lng`: Decimal(11, 8) - User's longitude

### jobs table
- `location_lat`: Decimal(10, 8) - Job location latitude
- `location_lng`: Decimal(11, 8) - Job location longitude

## Testing

### Run E2E Tests
```bash
npm run test:e2e -- location.e2e-spec.ts
```

### Test Coverage
- ✅ Find nearby nannies with default radius
- ✅ Find nearby nannies with custom radius
- ✅ Handle empty results
- ✅ Validate latitude range (-90 to 90)
- ✅ Validate longitude range (-180 to 180)
- ✅ Validate radius range (1 to 100)
- ✅ Find nearby jobs with default radius
- ✅ Find nearby jobs with custom radius
- ✅ Geocode valid addresses
- ✅ Handle invalid inputs

### Test Data
The seed file includes:
- 3 nannies with Indian locations:
  - 2 in Mumbai (Andheri, Powai)
  - 1 in Bangalore (Koramangala)
- 1 parent in Mumbai (Bandra)
- 3 jobs with Mumbai locations (Juhu, Lower Parel, Goregaon)
- Hourly rates in INR (₹250-₹350 per hour)
- Indian phone numbers (+91 format)
- Skills include regional languages (Hindi, Marathi, Kannada, Tamil)

## Implementation Details

### Distance Calculation Algorithm
Uses the **Haversine formula** to calculate the great-circle distance between two points on Earth:

```
a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
c = 2 ⋅ atan2(√a, √(1−a))
d = R ⋅ c
```

Where:
- φ is latitude
- λ is longitude
- R is Earth's radius (6371 km)

### Performance Considerations
- Current implementation loads all users/jobs and filters in-memory
- For production with large datasets, consider:
  - PostgreSQL PostGIS extension for spatial queries
  - Database-level geo-indexing
  - Caching frequently searched locations

## Future Enhancements

1. **PostGIS Integration**
   - Use PostgreSQL's PostGIS extension for optimized spatial queries
   - Add spatial indexes for better performance

2. **Advanced Filtering**
   - Filter by skills, hourly rate, availability
   - Sort by rating, experience, or distance

3. **Geofencing**
   - Define service areas for nannies
   - Automatic job matching based on location

4. **Distance Matrix**
   - Calculate actual travel time/distance using Google Distance Matrix API
   - Consider traffic conditions

5. **Location History**
   - Track user location updates
   - Suggest jobs based on frequent locations

## Dependencies

```json
{
  "@googlemaps/google-maps-services-js": "^3.x.x",
  "axios": "^1.x.x"
}
```

## Module Structure

```
src/location/
├── dto/
│   ├── geocode.dto.ts          # DTO for geocoding requests
│   ├── nearby-search.dto.ts    # DTO for nearby search queries
│   └── index.ts                # Export all DTOs
├── location.controller.ts      # REST API endpoints
├── location.service.ts         # Business logic
└── location.module.ts          # Module configuration
```

## Notes

- The geocoding endpoint will return `success: false` if the Google Maps API key is not configured
- Distance calculations are accurate for most use cases but may have slight variations for very long distances
- All coordinates use the WGS84 datum (standard for GPS)
- Nannies must be verified (`is_verified: true`) to appear in nearby searches
- Only open jobs (`status: 'open'`) appear in nearby job searches
