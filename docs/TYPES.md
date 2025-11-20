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
  skills: string[];
  experience_years: number | null;
  hourly_rate: string | null; // Decimal stored as string
  bio: string | null;
  availability_schedule: Record<string, string[]> | null;
  created_at: string;
  updated_at: string;
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
