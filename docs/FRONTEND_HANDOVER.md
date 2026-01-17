# Backend -> Frontend Handover: Security Overhaul

> [!WARNING]
> **BREAKING CHANGE**: Authentication logic has changed significantly to meet security requirements. Please update your specific auth handling code.

## 1. Authentication Changes (HttpOnly Cookies)

### **Login (`POST /auth/login`)**
- **Old Behavior**: Returned `{ access_token, refresh_token, user }` in JSON body.
- **New Behavior**: 
  - Returns `{ user: ... }` in JSON body.
  - Sets `access_token` and `refresh_token` as **HttpOnly Cookies**.
  - **Action Required**: Stop reading tokens from response body. Rely on the browser to handle cookies automatically.

### **Logout (`POST /auth/logout`)**
- **New Endpoint**: You must call this endpoint to log the user out.
- **Behavior**: Clears the auth cookies.

### **Refresh (`POST /auth/refresh`)**
- **Old Behavior**: Required `{ refresh_token }` in body.
- **New Behavior**: 
  - Expects empty body (reads `refresh_token` from cookie).
  - Sets new cookies on success.

### **Google OAuth**
- **Old Behavior**: Redirected with tokens in URL (`?access_token=...`).
- **New Behavior**: 
  - Sets cookies on the response.
  - Redirects to `/auth/callback` **without tokens in URL**.
  - **Action Required**: On the callback page, simply make a request to `/users/me` (or similar) to verify the user is logged in. The cookies will be sent automatically.

## 2. Error Handling & Revocation
- **Immediate Revocation**: If a user is banned, their next request will fail with `401 Unauthorized` immediately.
- **Action Required**: Ensure your global error handler redirects to login/blocked page upon receiving `401` from protected endpoints.

## 3. SVG Uploads
- **Policy**: Direct SVG uploads are currently blocked.
- **Sanitization**: If SVG uploads are enabled in the future, they will be automatically sanitized on the backend.

## 4. Development vs Production
- **Localhost**: Cookies are set with `SameSite=Lax` (if needed for dev flow) or `Strict`.
- **Production**: Cookies are `Secure`, `HttpOnly`, `SameSite=Strict`.
- **Note**: Ensure your frontend makes requests with `credentials: 'include'` (or `withCredentials: true` in axios) to send cookies.
