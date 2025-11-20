# TypeScript Type Definitions

Use these interfaces to type your frontend application.

## User Models

```typescript
export type UserRole = 'parent' | 'nanny' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
  oauth_provider?: 'google' | null;
  oauth_provider_id?: string | null;
  created_at: string;  // ISO 8601 timestamp
  updated_at: string;  // ISO 8601 timestamp
  profiles?: UserProfile;
  nanny_details?: NannyDetails;
  // Note: Sensitive fields excluded from API responses:
  // password_hash, oauth_access_token, oauth_refresh_token,
  // verification_token, reset_password_token
}

export interface UserProfile {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  lat: string | null; // Decimal stored as string
  lng: string | null; // Decimal stored as string
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface NannyDetails {
  user_id: string;
  skills: string[];  // e.g., ["CPR Certified", "First Aid", "Early Childhood Education"]
  experience_years: number | null;
  hourly_rate: string | null;  // Decimal stored as string (e.g., "800.00")
  bio: string | null;
  availability_schedule: AvailabilitySchedule | null;
  created_at: string;  // ISO 8601 timestamp
  updated_at: string;  // ISO 8601 timestamp
}

export interface AvailabilitySchedule {
  [day: string]: string[];  // e.g., { "monday": ["09:00-17:00", "18:00-21:00"] }
}
```

## Job Models

```typescript
export type JobStatus = 'open' | 'closed' | 'cancelled';

export interface Job {
  id: string;
  parent_id: string;
  title: string;
  description: string | null;
  date: string; // Date
  time: string; // Time
  location_lat: string | null; // Decimal stored as string
  location_lng: string | null; // Decimal stored as string
  status: JobStatus;
  created_at: string;
  updated_at: string;
}
```

## Authentication Models

```typescript
// Authentication DTOs
export interface SignupDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface GoogleUser {
  email: string;
  oauth_provider_id: string;
  oauth_access_token?: string;
  oauth_refresh_token?: string;
}
```

## Location Models

```typescript
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface NearbyNanny {
  id: string;
  email: string;
  role: 'nanny';
  profile: UserProfile | null;
  nanny_details: NannyDetails | null;
  distance: number; // in kilometers
}

export interface NearbyJob {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  location_lat: string | null;
  location_lng: string | null;
  status: JobStatus;
  parent: {
    id: string;
    email: string;
    role: 'parent';
    profiles: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  } | null;
  distance: number; // in kilometers
}
```

## DTOs (Data Transfer Objects)

```typescript
export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  lat?: number;
  lng?: number;
  profileImageUrl?: string;
  skills?: string[];
  experienceYears?: number;
  hourlyRate?: number;
  bio?: string;
  availabilitySchedule?: any;
}

export interface GeocodeAddressDto {
  address: string;
}

export interface NearbySearchDto {
  lat: number;
  lng: number;
  radius?: number;
}
```

## Response Wrappers

```typescript
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NearbySearchResponse<T> extends ApiResponse<T[]> {
  count: number;
  radius: string;
}
```
