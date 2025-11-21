# Care Connect - System Architecture

## 🎯 Platform Model

**Type**: On-Demand Auto-Matching Service Platform  
**Similar to**: Uber, Lyft, TaskRabbit  
**Industry**: Childcare Services

---

## 🔄 Core User Flow

### Parent Journey
1. **Create Service Request**
   - Select date and time needed
   - Specify duration (hours)
   - Enter number of children and ages
   - Add special requirements (optional)
   - Location auto-filled from profile
   - Submit request

2. **Automatic Matching**
   - System finds available nannies nearby
   - Assigns request to best match
   - Parent receives confirmation

3. **Wait for Acceptance**
   - Nanny has limited time to respond
   - If rejected, system auto-assigns to next nanny
   - Parent notified of assignment status

4. **Service Confirmed**
   - Booking automatically created
   - Nanny contact info revealed
   - Service details confirmed

5. **Service Day**
   - Receive reminder notification
   - Nanny arrives and starts service
   - Track service progress

6. **Completion**
   - Service marked complete
   - Payment processed
   - Leave review for nanny

### Nanny Journey
1. **Set Availability**
   - Configure weekly schedule
   - Set hourly rate
   - Update skills and experience
   - Enable location services

2. **Receive Assignment**
   - Push notification for new request
   - View request details:
     - Parent info
     - Location and distance
     - Date/time and duration
     - Number of children
     - Offered rate

3. **Accept or Reject**
   - Limited time to respond (e.g., 5 minutes)
   - Accept → Booking created
   - Reject → Request goes to next nanny
   - Timeout → Auto-rejected

4. **Service Confirmed**
   - View parent contact info
   - Get directions to location
   - Prepare for service

5. **Service Day**
   - Mark service as started
   - Provide childcare
   - Mark service as completed

6. **Get Paid**
   - Payment automatically processed
   - Receive review from parent
   - Leave review for parent

---

## 🧠 Smart Matching Algorithm

### Ranking Criteria (in order of priority)

1. **Availability** (Must-have)
   - Nanny must be available for requested time slot
   - Check against weekly availability schedule
   - Check for existing bookings (no conflicts)

2. **Proximity** (High priority)
   - Calculate distance using Haversine formula
   - Prefer nannies within configurable radius (default: 10km)
   - Sort by closest first

3. **Skills Match** (Medium priority)
   - Match required skills if specified by parent
   - Examples: First Aid, CPR, Special Needs, Infant Care

4. **Rating** (Medium priority)
   - Higher-rated nannies ranked higher
   - Minimum rating threshold (e.g., 4.0+)

5. **Experience** (Low priority)
   - More experienced nannies preferred
   - Years of experience as tiebreaker

6. **Hourly Rate** (Low priority)
   - Lower rates preferred (parent perspective)
   - Within parent's budget if specified

### Assignment Process

```
1. Find all nannies matching criteria
2. Sort by ranking algorithm
3. Assign to #1 ranked nanny
4. Start timeout timer (e.g., 5 minutes)
5. If accepted → Create booking ✅
6. If rejected/timeout → Assign to #2 ranked nanny
7. Repeat until accepted or no more matches
8. If no matches → Notify parent, suggest expanding search
```

---

## 📊 Database Schema Changes Needed

### New Tables Required

#### `service_requests`
```sql
- id (UUID, PK)
- parent_id (UUID, FK → users)
- date (DATE)
- start_time (TIME)
- duration_hours (DECIMAL)
- num_children (INTEGER)
- children_ages (JSONB) -- e.g., [2, 5, 7]
- special_requirements (TEXT)
- location_lat (DECIMAL)
- location_lng (DECIMAL)
- status (ENUM: pending, assigned, accepted, in_progress, completed, cancelled)
- current_assignment_id (UUID, FK → assignments, nullable)
- max_hourly_rate (DECIMAL, nullable) -- parent's budget
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `assignments`
```sql
- id (UUID, PK)
- request_id (UUID, FK → service_requests)
- nanny_id (UUID, FK → users)
- assigned_at (TIMESTAMP)
- response_deadline (TIMESTAMP) -- assigned_at + timeout duration
- status (ENUM: pending, accepted, rejected, timeout)
- rejection_reason (TEXT, nullable)
- responded_at (TIMESTAMP, nullable)
- rank_position (INTEGER) -- which rank this nanny was (1st, 2nd, 3rd choice)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Modified Tables

#### `bookings`
- Add `assignment_id` (UUID, FK → assignments)
- Remove `parent_id` (get from assignment → request)
- Status becomes: confirmed, in_progress, completed, cancelled
- Remove "requested" status (handled by assignments)

#### `nanny_details`
- Ensure `availability_schedule` is properly structured
- Add `is_available_now` (BOOLEAN) -- for instant availability
- Add `acceptance_rate` (DECIMAL) -- percentage of accepted assignments

---

## 🔔 Notification Flow

### Parent Notifications
1. ✅ Request created confirmation
2. 🔄 Assignment sent to nanny (nanny name)
3. ⏰ Waiting for nanny response
4. ❌ Nanny rejected, reassigning...
5. ✅ Nanny accepted! Booking confirmed
6. ⏰ Service starting in 1 hour
7. ▶️ Service started
8. ✅ Service completed
9. 💳 Payment processed
10. ⭐ Please review your nanny

### Nanny Notifications
1. 🔔 New assignment! Respond within X minutes
2. ⏰ Assignment expiring soon (1 min left)
3. ✅ Assignment accepted, booking confirmed
4. ⏰ Service starting in 1 hour
5. 📍 Parent location and contact info
6. ✅ Service completed
7. 💰 Payment received
8. ⭐ Please review the parent

---

## ⚙️ Configuration Settings

### Admin Configurable
- **Matching Radius**: Default 10km, adjustable per region
- **Assignment Timeout**: Default 5 minutes
- **Max Re-assignments**: Default 5 attempts before giving up
- **Minimum Nanny Rating**: Default 4.0 stars
- **Service Reminder Time**: Default 1 hour before service

### Nanny Configurable
- **Availability Schedule**: Weekly recurring schedule
- **Instant Availability**: Toggle for immediate bookings
- **Preferred Service Radius**: Max distance willing to travel
- **Minimum Booking Duration**: e.g., 2 hours minimum

### Parent Configurable
- **Preferred Skills**: Required or preferred skills
- **Max Hourly Rate**: Budget limit
- **Preferred Nanny**: Option to request specific nanny (if available)

---

## 🚀 Implementation Priority

### Phase 1: Core Matching (MVP)
1. Service request creation
2. Basic matching algorithm (proximity + availability)
3. Assignment system
4. Accept/reject functionality
5. Automatic booking creation

### Phase 2: Enhanced Matching
1. Skills-based filtering
2. Rating-based ranking
3. Re-assignment logic
4. Timeout handling

### Phase 3: Notifications
1. Push notifications
2. Email alerts
3. SMS (optional)

### Phase 4: Advanced Features
1. Preferred nanny requests
2. Recurring service requests
3. Instant availability toggle
4. Advanced analytics

---

## 🔐 Business Rules

### Assignment Rules
- Nanny can only have 1 pending assignment at a time
- Nanny cannot be assigned if already booked for that time
- Maximum 5 re-assignment attempts per request
- After 5 rejections, notify parent to adjust criteria

### Cancellation Rules
- **Parent cancels before acceptance**: No fee
- **Parent cancels after acceptance, >24h before**: Small fee (e.g., 10%)
- **Parent cancels <24h before**: Larger fee (e.g., 50%)
- **Nanny cancels after acceptance**: Penalty, affects rating
- **Nanny no-show**: Severe penalty, possible suspension

### Payment Rules
- Payment authorized when booking confirmed
- Payment captured when service completed
- Platform commission deducted (e.g., 15-20%)
- Payout to nanny within 24-48 hours
- Refund policy based on cancellation timing

---

## 📈 Success Metrics

### Platform Health
- Average time to match (target: <5 minutes)
- Match success rate (target: >90%)
- Average re-assignments per request (target: <2)

### User Satisfaction
- Parent satisfaction score (target: >4.5/5)
- Nanny acceptance rate (target: >60%)
- Service completion rate (target: >95%)

### Business Metrics
- Bookings per day
- Average booking value
- Platform commission revenue
- User retention rate

---

**Last Updated**: November 21, 2025  
**Version**: 2.0 (Auto-Matching Model)
