# Frontend Integration Guide - Scheduling & Availability

## Overview
This document provides complete integration details for the Recurring Bookings and Availability Blocking features.

## 🔄 Recurring Bookings

### API Endpoints

#### Create Recurring Booking
```http
POST /recurring-bookings
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "nannyId": "uuid",
  "recurrencePattern": "WEEKLY_MON_WED_FRI",
  "startDate": "2024-12-10",
  "endDate": "2025-01-10",  // Optional
  "startTime": "09:00",
  "durationHours": 4,
  "numChildren": 2,
  "childrenAges": [3, 5],
  "specialRequirements": "Allergy to peanuts"  // Optional
}
```

**Response:**
```json
{
  "id": "uuid",
  "parent_id": "uuid",
  "nanny_id": "uuid",
  "recurrence_pattern": "WEEKLY_MON_WED_FRI",
  "start_date": "2024-12-10T00:00:00.000Z",
  "end_date": "2025-01-10T00:00:00.000Z",
  "start_time": "09:00",
  "duration_hours": 4,
  "num_children": 2,
  "children_ages": [3, 5],
  "special_requirements": "Allergy to peanuts",
  "is_active": true,
  "created_at": "2024-12-02T12:00:00.000Z"
}
```

#### List Recurring Bookings
```http
GET /recurring-bookings
Authorization: Bearer {access_token}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "recurrence_pattern": "WEEKLY_MON_WED_FRI",
    "start_date": "2024-12-10T00:00:00.000Z",
    "is_active": true,
    "users_recurring_bookings_parent_idTousers": {
      "id": "uuid",
      "email": "parent@example.com",
      "profiles": { "full_name": "John Doe" }
    },
    "users_recurring_bookings_nanny_idTousers": {
      "id": "uuid",
      "email": "nanny@example.com",
      "profiles": { "full_name": "Jane Smith" },
      "nanny_details": { "hourly_rate": 25 }
    }
  }
]
```

#### Get Recurring Booking Details
```http
GET /recurring-bookings/:id
Authorization: Bearer {access_token}
```

**Response:** (includes generated bookings)
```json
{
  "id": "uuid",
  "recurrence_pattern": "WEEKLY_MON_WED",
  "bookings": [
    {
      "id": "uuid",
      "start_time": "2024-12-11T09:00:00.000Z",
      "status": "CONFIRMED"
    },
    {
      "id": "uuid",
      "start_time": "2024-12-13T09:00:00.000Z",
      "status": "CONFIRMED"
    }
  ]
}
```

#### Update Recurring Booking
```http
PUT /recurring-bookings/:id
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "recurrencePattern": "WEEKLY_MON_WED",  // Optional
  "endDate": "2025-02-01",  // Optional
  "isActive": false  // Optional - to pause/resume
}
```

#### Delete (Deactivate) Recurring Booking
```http
DELETE /recurring-bookings/:id
Authorization: Bearer {access_token}
```

### Recurrence Patterns

| Pattern | Description | Days Generated |
|---------|-------------|----------------|
| `DAILY` | Every day | Mon-Sun |
| `WEEKLY_MON` | Every Monday | Monday only |
| `WEEKLY_MON_WED_FRI` | Mon, Wed, Fri | Monday, Wednesday, Friday |
| `WEEKLY_TUE_THU` | Tue, Thu | Tuesday, Thursday |
| `MONTHLY_1` | 1st of month | 1st day |
| `MONTHLY_1_15` | 1st & 15th | 1st and 15th days |

**Day Codes:** `SUN`, `MON`, `TUE`, `WED`, `THU`, `FRI`, `SAT`

### UI Implementation Suggestions

#### Pattern Selector Component
```tsx
const RecurrencePatternSelector = () => {
  const [frequency, setFrequency] = useState('weekly');
  const [selectedDays, setSelectedDays] = useState([]);
  
  const generatePattern = () => {
    if (frequency === 'daily') return 'DAILY';
    if (frequency === 'weekly') {
      return `WEEKLY_${selectedDays.join('_')}`;
    }
    if (frequency === 'monthly') {
      return `MONTHLY_${selectedDays.join('_')}`;
    }
  };
  
  return (
    <div>
      <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      
      {frequency === 'weekly' && (
        <DaySelector days={['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']} 
                     selected={selectedDays} 
                     onChange={setSelectedDays} />
      )}
      
      {frequency === 'monthly' && (
        <DateSelector dates={[1,2,3,...,31]} 
                      selected={selectedDays} 
                      onChange={setSelectedDays} />
      )}
    </div>
  );
};
```

---

## 🚫 Availability Blocking

### API Endpoints

#### Create Availability Block
```http
POST /availability/block
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "startTime": "2024-12-14T00:00:00Z",
  "endTime": "2024-12-15T23:59:59Z",
  "isRecurring": true,  // Optional
  "recurrencePattern": "WEEKLY_SAT_SUN",  // Required if isRecurring=true
  "reason": "Weekend unavailable"  // Optional
}
```

**Response:**
```json
{
  "id": "uuid",
  "nanny_id": "uuid",
  "start_time": "2024-12-14T00:00:00.000Z",
  "end_time": "2024-12-15T23:59:59.000Z",
  "is_recurring": true,
  "recurrence_pattern": "WEEKLY_SAT_SUN",
  "reason": "Weekend unavailable",
  "created_at": "2024-12-02T12:00:00.000Z"
}
```

#### List Availability Blocks
```http
GET /availability
Authorization: Bearer {access_token}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "start_time": "2024-12-14T00:00:00.000Z",
    "end_time": "2024-12-15T23:59:59.000Z",
    "is_recurring": true,
    "recurrence_pattern": "WEEKLY_SAT_SUN",
    "reason": "Weekend unavailable"
  }
]
```

#### Delete Availability Block
```http
DELETE /availability/:id
Authorization: Bearer {access_token}
```

### UI Implementation Suggestions

#### Calendar View with Blocked Times
```tsx
const AvailabilityCalendar = ({ blocks }) => {
  const isBlocked = (date) => {
    return blocks.some(block => {
      if (block.is_recurring) {
        return matchesPattern(date, block.recurrence_pattern);
      }
      return date >= block.start_time && date <= block.end_time;
    });
  };
  
  return (
    <Calendar 
      tileClassName={({ date }) => isBlocked(date) ? 'blocked' : ''}
      tileDisabled={({ date }) => isBlocked(date)}
    />
  );
};
```

---

## 🔔 Important Notes

### Auto-Generation Timing
- Cron job runs **daily at midnight** (server time)
- Bookings are generated **1 day in advance**
- Example: On Dec 10, bookings for Dec 11 are created

### Matching Integration
- Nannies with availability blocks are **automatically filtered out** during matching
- Blocks are checked against request start/end times
- Recurring blocks are evaluated for pattern match

### Best Practices
1. **Validate dates**: Ensure `startDate` < `endDate`
2. **Pattern validation**: Use provided day codes only
3. **Time zones**: All times are stored in UTC
4. **Error handling**: Handle 404 for non-existent resources

---

## 📱 Example Flows

### Parent Creates Weekly Recurring Booking
1. Parent selects nanny
2. Chooses "Weekly" frequency
3. Selects days: Monday, Wednesday, Friday
4. Sets start date, end date (optional)
5. Frontend generates pattern: `WEEKLY_MON_WED_FRI`
6. POST to `/recurring-bookings`
7. Display confirmation with next 3 upcoming dates

### Nanny Blocks Weekends
1. Nanny navigates to availability settings
2. Selects "Block time"
3. Chooses "Recurring" option
4. Selects Saturday & Sunday
5. Frontend generates pattern: `WEEKLY_SAT_SUN`
6. POST to `/availability/block`
7. Calendar updates to show blocked weekends

---

## 🐛 Error Responses

```json
{
  "statusCode": 400,
  "message": "Invalid recurrence pattern",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 404,
  "message": "Recurring booking not found",
  "error": "Not Found"
}
```

---

## 🧪 Testing Checklist

- [ ] Create daily recurring booking
- [ ] Create weekly recurring booking (multiple days)
- [ ] Create monthly recurring booking
- [ ] Update recurring booking pattern
- [ ] Deactivate recurring booking
- [ ] View generated bookings from recurring
- [ ] Create one-time availability block
- [ ] Create recurring availability block
- [ ] Delete availability block
- [ ] Verify blocked nanny not matched
