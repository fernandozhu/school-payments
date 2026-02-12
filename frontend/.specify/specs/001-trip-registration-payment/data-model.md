# Data Model: School Trip Registration & Payment

**Feature Branch**: `001-trip-registration-payment`
**Date**: 2026-02-12

## Frontend Types

These types represent the data structures used in the frontend
application. They map to the backend API contract.

### FieldTrip

Represents a school field trip returned by the GET /api/fieldtrip
endpoint.

| Field    | Type   | Description                          |
|----------|--------|--------------------------------------|
| id       | string | UUID identifier for the field trip   |
| location | string | Trip destination / name              |
| cost     | number | Trip cost in dollars                 |
| date     | string | ISO datetime string for the trip date|

### PaymentRequest

Represents the POST body sent to /api/payment.

| Field              | Type   | Validation                       |
|--------------------|--------|----------------------------------|
| student_first_name | string | Required, non-empty              |
| student_last_name  | string | Required, non-empty              |
| parent_first_name  | string | Required, non-empty              |
| parent_last_name   | string | Required, non-empty              |
| email              | string | Required, valid email format     |
| field_trip_id      | string | UUID, auto-populated from trip   |
| school_id          | string | UUID, from URL query parameter   |
| card_number        | string | Required, exactly 16 digits      |
| expiry_date        | string | Required, MM/YY format           |
| cvv                | string | Required, exactly 3 digits       |

### PaymentResponse

Represents the response from POST /api/payment.

| Field          | Type    | Description                        |
|----------------|---------|------------------------------------|
| success        | boolean | Whether payment succeeded          |
| transaction_id | string? | Transaction ID if successful       |
| error_message  | string? | Error description if failed        |

### FormErrors

Tracks validation errors for each form field.

| Field              | Type    | Description                      |
|--------------------|---------|----------------------------------|
| student_first_name | string? | Error message for this field     |
| student_last_name  | string? | Error message for this field     |
| parent_first_name  | string? | Error message for this field     |
| parent_last_name   | string? | Error message for this field     |
| email              | string? | Error message for this field     |
| card_number        | string? | Error message for this field     |
| expiry_date        | string? | Error message for this field     |
| cvv                | string? | Error message for this field     |

## State Transitions

### Page State

```
Loading → Success (trip data loaded)
Loading → Error (fetch failed)
Error → Loading (retry clicked)
```

### Modal State

```
Closed → Open (Register button clicked)
Open → Closed (Cancel/close clicked)
```

### Payment State (within modal)

```
Idle → Submitting (form submitted with valid data)
Submitting → Success (API returned success)
Submitting → Failed (API returned failure)
Failed → Idle (retry clicked)
Success → Closed (acknowledged)
```
