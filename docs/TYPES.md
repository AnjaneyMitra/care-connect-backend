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
  created_at: string;
  updated_at: string;
  profiles?: UserProfile;
  nanny_details?: NannyDetails;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  bio: string | null;
  profile_image_url: string | null;
  lat: number | null;
  lng: number | null;
}

export interface NannyDetails {
  id: string;
  user_id: string;
  experience_years: number | null;
  hourly_rate: number | null;
  skills: string[];
  certifications: string[];
  availability_schedule: Record<string, string[]> | null;
  rating: number | null;
  reviews_count: number;
  background_check_status: string;
}
```

## Job Models

```typescript
export type JobStatus = 'open' | 'closed' | 'in_progress' | 'completed' | 'cancelled';

export interface Job {
  id: string;
  parent_id: string;
  title: string;
  description: string | null;
  requirements: string[];
  location_lat: number | null;
  location_lng: number | null;
  start_date: string | null;
  end_date: string | null;
  status: JobStatus;
  created_at: string;
  updated_at: string;
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
