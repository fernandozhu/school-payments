# API Contracts: School Trip Registration & Payment

**Feature Branch**: `001-trip-registration-payment`
**Date**: 2026-02-12

## Base Configuration

All endpoint URLs are configured via environment variable and
a config module:

- Environment variable: `VITE_API_BASE_URL`
- Config file: `src/config.ts`
- Endpoints are path constants appended to the base URL

## Endpoints

### GET {BASE_URL}/api/fieldtrip

Fetches the list of available field trips.

**Request**: No body. No required query parameters.

**Response** (200 OK):
```json
[
  {
    "id": "93e2d653-6101-45b9-8e74-0fab1dfbacdb",
    "location": "Auckland Zoo",
    "cost": 20.00,
    "date": "2026-10-10T00:00:00Z"
  }
]
```

**Response fields**:

| Field    | Type   | Description                   |
|----------|--------|-------------------------------|
| id       | string | UUID of the field trip        |
| location | string | Trip destination name         |
| cost     | number | Cost in dollars               |
| date     | string | ISO 8601 datetime             |

**Error responses**:
- 500: Server error (display generic error with retry)

---

### POST {BASE_URL}/api/payment

Submits a payment for a field trip registration.

**Request headers**:
```
Content-Type: application/json
```

**Request body**:
```json
{
  "student_first_name": "Alice",
  "student_last_name": "Smith",
  "parent_first_name": "Jane",
  "parent_last_name": "Smith",
  "field_trip_id": "93e2d653-6101-45b9-8e74-0fab1dfbacdb",
  "card_number": "1234567890123456",
  "expiry_date": "12/27",
  "cvv": "123",
  "email": "jane.smith@email.com",
  "school_id": "a745da7f-c91b-4ff0-9beb-5bc1c82f125c"
}
```

**Request field validation**:

| Field              | Type   | Rules                              |
|--------------------|--------|------------------------------------|
| student_first_name | string | Required, non-empty                |
| student_last_name  | string | Required, non-empty                |
| parent_first_name  | string | Required, non-empty                |
| parent_last_name   | string | Required, non-empty                |
| field_trip_id      | string | Required, valid UUID               |
| card_number        | string | Required, exactly 16 digits        |
| expiry_date        | string | Required, MM/YY format             |
| cvv                | string | Required, exactly 3 digits         |
| email              | string | Required, valid email format       |
| school_id          | string | Required, valid UUID               |

**Success response** (201 Created):
```json
{
  "id": "TX-1739378400-1234",
  "date": "2026-02-12T12:00:00Z",
  "amount": "20.00",
  "student": 1,
  "activity": "93e2d653-6101-45b9-8e74-0fab1dfbacdb"
}
```

**Error responses**:
- 400: Validation error (field-level errors in response body)
  ```json
  {
    "card_number": ["Card number must be exactly 16 digits."],
    "email": ["Enter a valid email address."]
  }
  ```
- 500: Server error or payment processing failure
