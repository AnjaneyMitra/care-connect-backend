# Care Connect - Roadmap

This roadmap outlines the unimplemented features from `features.md` and additional feature ideas for the Care Connect application.

## 🚧 Unimplemented Features (from features.md)

### 1. Authentication & Authorization
- [x] **Refresh Token Rotation**: Currently only access tokens are issued.
- [x] **Forgot/Reset Password Flow**: Endpoints and logic missing.
- [x] **Account Verification**: Email/SMS verification flow not implemented (only implicit via Google OAuth).

### 2. User & Profile Management
- [ ] **Profile Image Upload**: Cloudinary/S3 integration for image uploads.

### 3. Service Request & Auto-Matching
- [x] **Assignment Timeout Handling**: Automatic rejection after deadline.
- [x] **Cancel Request Endpoint**: Allow parents to cancel pending requests.
- [x] **Advanced Matching Logic**: Stricter skill matching and refined scoring.

### 4. Booking System
- [x] **Cancellation Reasons**: Store reason when booking is cancelled.
- [x] **Cancellation Fees**: Calculate fee if cancelled within 24 hours.
- [x] **Payment Release Trigger**: Create payment record on completion.
- [x] **Review Prompt Trigger**: Notify both parties to leave reviews.

### 5. Chat System
- [ ] **File/Image Uploads**: Allow sending images/files in chat.

### 6. Payment System
- [ ] **Payment Gateway Integration**: Stripe/PayPal integration.
- [ ] **Escrow System**: Hold payment until service completion.
- [ ] **Invoicing**: Generate receipts.

### 7. Admin Module
- [x] **Dispute Resolution**: Interface for handling disputes.
- [x] **Payment Monitoring**: View transaction history.
- [x] **Review Moderation**: Approve/reject reviews.
- [x] **Matching Configuration**: Dynamic adjustment of radius, timeout, etc.
- [x] **Advanced Analytics**: Detailed metrics beyond basic stats.

### 8. Notifications
- [ ] **External Channels**: SMS (Twilio) and Email (SendGrid/Resend) integration.

### 9. Reviews & Ratings
- [x] **Rating Categories**: Punctuality, professionalism, care quality, communication.
- [x] **Edit/Delete Reviews**: Allow users to modify their reviews.
- [x] **Review Responses**: Allow reviewees to respond.

## 🆕 New Feature Ideas

### 10. Location & AI Features
- [x] **Live Nanny Tracking**: Real-time location tracking via WebSocket when nanny is en route.
- [x] **Geofencing Alerts**: Notify parents if nanny arrives/leaves care location unexpectedly.
- [x] **Favorite Nannies**: Parents can favorite nannies for prioritized matching (+50 pts).
- [x] **AI-Powered Matching**: Gemini API learns from successful matches (+30 pts).

### 11. Background Checks & Verification
- [ ] **Background Check Integration**: Integrate with Checkr or similar service.
- [ ] **Document Verification**: Upload and verify certifications (CPR, First Aid).
- [ ] **Reference Checks**: Contact and verify references.

### 12. Scheduling & Availability
- [x] **Recurring Bookings**: Schedule weekly/monthly recurring care.
- [ ] **Calendar Integration**: Sync with Google Calendar/iCal.
- [x] **Availability Blocking**: Nannies can block out unavailable times.

### 13. Emergency Features
- [ ] **Emergency Contacts**: Store and access emergency contact info.
- [ ] **SOS Button**: Quick alert to parent/emergency services.
- [ ] **Incident Reporting**: Document and report incidents.

### 14. Gamification & Rewards
- [ ] **Achievement Badges**: Reward nannies for milestones.
- [ ] **Loyalty Program**: Discounts for frequent users.
- [ ] **Referral System**: Rewards for referring new users.

### 15. Enhanced Communication
- [ ] **Video Calls**: In-app video calling for interviews.
- [ ] **Voice Messages**: Send voice notes in chat.
- [ ] **Translation**: Auto-translate messages for multilingual support.

## 📊 Priority Levels

- **High**: Features 1, 3, 4, 6, 7, 9, 10 (Completed)
- **Medium**: Features 2, 5, 8, 11, 12
- **Low**: Features 13, 14, 15
