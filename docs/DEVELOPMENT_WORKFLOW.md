# Development Workflow

This document outlines the development and testing workflow for the Care Connect Backend.

## Branch Strategy

### Main Branches
- **`main`**: Production-ready code. Only merge tested and verified features here.
- **`development`**: Integration and testing branch. All features are tested here before merging to main.

### Feature Branches
- **`feature/*`**: Individual feature development branches (e.g., `feature/booking-system`)
- Features are developed in isolation, then merged to `development` for testing
- Once verified in `development`, they are merged to `main`

## Workflow

### 1. Feature Development
```bash
# Create a new feature branch from main
git checkout main
git checkout -b feature/feature-name

# Develop and commit your changes
git add .
git commit -m "Implement Feature X: Description"
```

### 2. Testing in Development
```bash
# Switch to development branch
git checkout development

# Merge your feature
git merge feature/feature-name

# Test the feature thoroughly
npm run build
npm run start:dev

# Run tests if available
npm run test
npm run test:e2e
```

### 3. Merge to Main (Production)
```bash
# Once testing is complete and successful
git checkout main
git merge development

# Or merge specific feature if development has other WIP features
git merge feature/feature-name

# Push to remote
git push origin main
```

## Testing Checklist

Before merging to `main`, ensure:
- [ ] Code builds successfully (`npm run build`)
- [ ] All endpoints work as expected
- [ ] No breaking changes to existing features
- [ ] Documentation is updated
- [ ] Environment variables are documented
- [ ] Database migrations (if any) are tested

## Current Features Status

### Completed & Merged to Main
- ✅ Feature 1: Authentication & Authorization
- ✅ Feature 2: User & Profile Management
- ✅ Feature 3: Location & Geo Matching
- ✅ Feature 6: Booking System
- ✅ Feature 7: Messaging System (Real-Time Chat)
- ✅ Feature 9: Reviews & Ratings
- ✅ Feature 10: Admin Module
- ✅ Feature 11: Notifications System

### Pending
- ⏳ Feature 4: Service Request & Auto-Matching (In Progress - Friend)
- ⏳ Feature 5: Nanny Assignment Management (In Progress - Friend)
- ⏳ Feature 8: Payments & Payouts

## Commit Message Convention

Use clear, descriptive commit messages:

```
# Feature implementation
Implement Feature X: Brief description

# Bug fixes
Fix: Description of the bug fixed

# Documentation
Docs: Update API documentation for Feature X

# Testing
Test: Add E2E tests for Feature X

# Refactoring
Refactor: Improve code structure in Module X
```

## Notes

- Always test in `development` before merging to `main`
- Keep `main` stable and production-ready at all times
- Document any breaking changes or new environment variables
- Update API documentation with each feature
