# Project Roadmap & Feature Status

## 🚧 Unimplemented Features (from features.md)

### 1. Authentication & Authorization
- [x] **Refresh Token Rotation**: Currently only access tokens are issued.
- [x] **Forgot/Reset Password Flow**: Endpoints and logic missing.
- [x] **Account Verification**: Email/SMS verification flow not implemented (only implicit via Google OAuth).

### 2. User & Profile Management
- [ ] **Profile Image Upload**: Cloudinary/S3 integration for image uploads.

### 3. Service Request & Auto-Matching
- [x] **Assignment Timeout Handling**: No scheduled task to auto-reject assignments after the deadline.
- [x] **Cancel Request**: Endpoint to cancel a pending request before acceptance.
- [x] **Advanced Matching Logic**:
    - `children_ages` and `required_skills` validation is basic.
    - `max_hourly_rate` logic is basic.

### 4. Booking System
- [x] **Cancellation Reason**: Storage for cancellation reasons.
- [x] **Cancellation Fees**: Logic to calculate and charge fees.
- [x] **Payment Release**: Trigger payment release on completion.
- [x] **Review Trigger**: Automatic prompt for review after completion.

### 5. Messaging System
- [ ] **File/Image Uploads**: Endpoint to handle attachment uploads for chat.

### 6. Payments & Payouts (Major Missing Module)
- [ ] **Payment Gateway Integration**: Stripe Connect or Razorpay.
- [ ] **Escrow System**: Hold funds at booking.
- [ ] **Commission Logic**: Deduct platform fee.
- [ ] **Payouts**: Automated transfer to nannies.
- [ ] **Invoicing**: Generate receipts.

### 7. Admin Module
- [x] **Dispute Resolution**: Interface for handling disputes.
- [x] **Payment Monitoring**: View transaction history.
- [x] **Review Moderation**: Approve/reject reviews.
- [x] **Matching Configuration**: Dynamic adjustment of radius, timeout, etc.
- [x] **Advanced Analytics**: Detailed metrics beyond basic stats.

### 8. Notifications
- [ ] **External Channels**: SMS (Twilio) and Email (SendGrid/Resend) integration.

---

## 💡 New Feature Ideas

### 🛡️ Trust & Safety
1.  **Background Check Integration**: Integrate with services like Checkr to automatically verify nanny backgrounds and display a "Verified" badge.
2.  **Emergency Assistance**: In-app "SOS" button for nannies and parents during active bookings, connecting to local emergency services or support.
3.  **Identity Verification**: AI-powered ID verification (e.g., matching selfie with ID card).

### 📍 Location & Real-Time
4.  **Live Nanny Tracking**: Allow parents to see the nanny's location when they are "En Route" to the booking.
5.  **Geofencing Alerts**: Notify parents if a nanny arrives or leaves the designated care location unexpectedly.

### 🤝 User Experience
6.  **Favorite Nannies**: Allow parents to "favorite" nannies. The matching algorithm could prioritize these nannies for future requests.
7.  **Calendar Sync**: Integrate with Google/Apple Calendar to automatically sync bookings and availability.
8.  **Multi-Language Support**: Internationalization (i18n) for the entire platform.

### 💰 Monetization & Loyalty
9.  **Loyalty Program**: Points system for parents (discounts) and nannies (bonuses) based on completed bookings and high ratings.
10. **Subscription Plans**: "Premium Parent" membership for waived booking fees or priority matching.
11. **Nanny Teams/Backups**: Allow nannies to form "teams" where a backup is automatically suggested if the primary nanny cancels.

### 🤖 AI & Automation
12. **AI-Powered Matching**: Use machine learning to improve matching over time based on successful past pairings and feedback.
13. **Smart Pricing**: Dynamic pricing suggestions for nannies based on demand, time of day, and location.
