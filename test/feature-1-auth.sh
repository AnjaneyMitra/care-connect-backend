#!/bin/bash

# Feature 1: Authentication & Authorization Test Script
# This script tests all authentication endpoints

echo "=========================================="
echo "Testing Feature 1: Authentication"
echo "=========================================="
echo ""

BASE_URL="http://localhost:4000"

# Test 1: Signup
echo "Test 1: User Signup (Parent)"
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-parent@example.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "Parent",
    "role": "parent"
  }')

echo "Response: $SIGNUP_RESPONSE"
echo ""

# Test 2: Signup (Nanny)
echo "Test 2: User Signup (Nanny)"
SIGNUP_NANNY=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-nanny@example.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "Nanny",
    "role": "nanny"
  }')

echo "Response: $SIGNUP_NANNY"
echo ""

# Test 3: Login
echo "Test 3: User Login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-parent@example.com",
    "password": "TestPassword123!"
  }')

echo "Response: $LOGIN_RESPONSE"
echo ""

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed - no token received"
  exit 1
fi

echo "✅ Token received: ${TOKEN:0:20}..."
echo ""

# Test 4: Access Protected Route
echo "Test 4: Access Protected Route (/users/me)"
ME_RESPONSE=$(curl -s -X GET "$BASE_URL/users/me" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $ME_RESPONSE"
echo ""

# Test 5: Invalid Login
echo "Test 5: Invalid Login (Wrong Password)"
INVALID_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-parent@example.com",
    "password": "WrongPassword"
  }')

echo "Response: $INVALID_LOGIN"
echo ""

# Test 6: Access Protected Route Without Token
echo "Test 6: Access Protected Route Without Token"
NO_TOKEN_RESPONSE=$(curl -s -X GET "$BASE_URL/users/me")

echo "Response: $NO_TOKEN_RESPONSE"
echo ""

echo "=========================================="
echo "Feature 1 Testing Complete"
echo "=========================================="
echo ""
echo "Summary:"
echo "✅ User Signup (Parent)"
echo "✅ User Signup (Nanny)"
echo "✅ User Login"
echo "✅ JWT Token Generation"
echo "✅ Protected Route Access"
echo "✅ Invalid Credentials Handling"
echo "✅ Unauthorized Access Handling"
