# Error Handling Guide

## Standard Error Response

All API errors follow this standard format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

For validation errors (400), the `message` field may be an array of strings detailing specific validation failures.

## Common Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| **200** | OK | Request succeeded |
| **201** | Created | Resource created successfully |
| **400** | Bad Request | Invalid input or validation failed |
| **401** | Unauthorized | Missing or invalid authentication token |
| **403** | Forbidden | Authenticated but not authorized (e.g., wrong role) |
| **404** | Not Found | Resource does not exist |
| **409** | Conflict | Resource already exists (e.g., duplicate email) |
| **500** | Internal Server Error | Something went wrong on the server |

## Handling Specific Errors

### Validation Errors (400)
When sending invalid data (e.g., missing required fields), you'll receive a 400 error.
**Example:**
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

### Geocoding Errors
If the address cannot be geocoded:
```json
{
  "success": false,
  "message": "Could not geocode the provided address"
}
```

### Authentication Errors (401)
If the token is expired or invalid:
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**Action**: Redirect user to login page.
