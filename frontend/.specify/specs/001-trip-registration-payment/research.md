# Research: School Trip Registration & Payment

**Feature Branch**: `001-trip-registration-payment`
**Date**: 2026-02-12

## R1: Field Trip Data Model vs Spec

**Decision**: Align frontend display with actual backend FieldTrip
model fields: `id` (UUID), `location` (string), `cost` (float),
`date` (datetime). The spec mentions "name" and "description" but
these do not exist in the backend model.

**Rationale**: The backend is the source of truth. The `location`
field serves as both the trip name and destination. No description
field is available, so the main page will display location, date,
and cost.

**Alternatives considered**:
- Add name/description to the backend: rejected (out of scope;
  backend is an existing service).
- Show placeholder description: rejected (misleading if data
  doesn't exist).

## R2: Form Fields vs Payment API Contract

**Decision**: The registration form collects exactly what the
POST /api/payment endpoint requires:
- `student_first_name`, `student_last_name`
- `parent_first_name`, `parent_last_name`
- `email`
- `card_number` (16 digits)
- `expiry_date` (MM/YY)
- `cvv` (3 digits)
- `field_trip_id` (auto-populated from displayed trip)
- `school_id` (passed as a URL query parameter)

The spec's "phone number" and "grade level" fields are dropped
because the API does not accept them.

**Rationale**: Collecting data the backend cannot process creates
a false expectation. The form should only request data that will
be used.

**Alternatives considered**:
- Collect phone/grade and store client-side only: rejected
  (confusing UX, no purpose).
- Add fields to backend: rejected (out of scope).

## R3: school_id Sourcing

**Decision**: `school_id` is passed as a URL query parameter
(e.g., `?schoolId=<uuid>`). The config file stores only the
base API URLs, not business data like school identifiers.

**Rationale**: A school ID is contextual to who is accessing the
page (likely linked from a school portal). It should not be
hardcoded in config since multiple schools may use the system.
The `field_trip_id` is obtained from the GET /api/fieldtrip
response.

**Alternatives considered**:
- Hardcode in config: rejected (breaks multi-school support).
- Add a school selector dropdown: rejected (overcomplicates the
  single-page registration flow).

## R4: API Configuration Strategy

**Decision**: Create a `src/config.ts` file that reads API base
URLs from environment variables (`VITE_API_BASE_URL`). Endpoint
paths are constants in the config. This allows decoupling URLs
from component code.

**Rationale**: User explicitly requested endpoint URLs be
extracted to a config file. Vite environment variables
(`import.meta.env.VITE_*`) are the standard mechanism for
build-time configuration in Vite projects.

**Alternatives considered**:
- Runtime config via JSON fetch: overkill for two endpoints.
- Hardcode URLs: rejected (user explicitly asked for decoupling).

## R5: Component Library Strategy

**Decision**: Use shadcn/ui components for all UI elements. The
project already has the shadcn/ui CLI configured and a Button
component installed. Additional components needed:
- Dialog (for the registration modal)
- Input (for form fields)
- Label (for form labels)
- Card (for field trip info display)
- Spinner/Loader (use lucide-react Loader2 icon with animation)

**Rationale**: Constitution Principle III requires shadcn/ui as
the foundation. The project already has the infrastructure.

**Alternatives considered**:
- Custom modal implementation: rejected (violates constitution).
- Third-party form library (react-hook-form): not needed for a
  single form with straightforward validation. Native React
  state is sufficient and avoids adding a dependency.

## R6: Form Validation Approach

**Decision**: Client-side validation using native React state
management. Validate on blur for individual fields and on submit
for the full form. Validation rules:
- Required: all fields
- Email: standard email regex
- Card number: exactly 16 digits
- Expiry date: MM/YY format, not expired
- CVV: exactly 3 digits
- Names: non-empty strings

**Rationale**: The form is a single, flat form with
straightforward validation rules. Adding a form library (e.g.,
react-hook-form + zod) would be overengineering for this use
case. Constitution Principle III requires inline, real-time
feedback.

**Alternatives considered**:
- react-hook-form + zod: more powerful but adds two
  dependencies for a simple form.

## R7: State Management

**Decision**: Use React's built-in useState and useEffect hooks.
No global state management library needed.

**Rationale**: The app is a single-page, single-form flow.
State is local to the page and modal components. Adding Redux,
Zustand, or similar would violate the "no overengineering"
principle.

**Alternatives considered**:
- Context API: not needed (no deep prop drilling).
- Zustand/Redux: overkill for a single-view app.
