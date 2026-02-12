# Feature Specification: Add School Dropdown to Registration

**Feature Branch**: `002-add-school-dropdown`
**Created**: 2026-02-12
**Status**: Draft
**Input**: User description: "Add school as a mandatory dropdown select within the trip registration modal, also remove it from url param."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select School During Registration (Priority: P1)

A parent opens the registration modal for a field trip and sees a
dropdown listing all schools associated with that trip. They
select their child's school from the list before completing the
rest of the form. The selected school is submitted as part of the
payment request. The school selection is mandatory — the parent
cannot submit without choosing a school.

**Why this priority**: The school is a required field for the
payment. Without this change, the system relies on a URL
parameter which is fragile and not user-friendly.

**Independent Test**: Open the registration modal and verify the
school dropdown is present, displays school names, and blocks
submission when no school is selected.

**Acceptance Scenarios**:

1. **Given** a parent opens the registration modal, **When** the
   modal loads, **Then** a "School" dropdown is visible showing
   all schools returned by the field trip endpoint.
2. **Given** the dropdown is visible, **When** the parent opens
   it, **Then** each school name is listed as a selectable
   option.
3. **Given** no school is selected, **When** the parent attempts
   to submit the form, **Then** the form shows a validation
   error on the school field and blocks submission.
4. **Given** the parent has selected a school, **When** they
   submit the form, **Then** the selected school's ID is
   included in the payment request.
5. **Given** a field trip has only one associated school, **When**
   the modal opens, **Then** that school is automatically
   pre-selected in the dropdown.

---

### User Story 2 - Remove School ID from URL (Priority: P2)

The application no longer requires or reads a `schoolId` URL
query parameter. The page loads without any school-related query
parameter. All school selection happens within the registration
form.

**Why this priority**: Simplifies the URL and removes a source of
error (invalid or missing query parameters).

**Independent Test**: Load the page without any query parameters
and verify the page loads normally and registration works without
requiring a schoolId in the URL.

**Acceptance Scenarios**:

1. **Given** a parent navigates to the page without a `schoolId`
   query parameter, **When** the page loads, **Then** the field
   trip details display normally.
2. **Given** the `schoolId` was previously required in the URL,
   **When** the feature is deployed, **Then** existing bookmarks
   or links with `schoolId` still work (parameter is silently
   ignored).

---

### Edge Cases

- What happens if the field trip has zero associated schools?
- What happens if the school list changes between page load and
  form submission?
- How does the dropdown behave on mobile viewports?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The registration modal MUST include a mandatory
  "School" dropdown field populated with schools from the field
  trip data.
- **FR-002**: The dropdown MUST display school names as labels
  and use school IDs as the submitted values.
- **FR-003**: The school dropdown MUST be validated as required —
  submission MUST be blocked if no school is selected, with an
  inline error message.
- **FR-004**: The selected school ID MUST be sent as `school_id`
  in the payment request.
- **FR-005**: The application MUST NOT read or require a
  `schoolId` URL query parameter.
- **FR-006**: If a field trip has exactly one school, that school
  MUST be automatically pre-selected.
- **FR-007**: The field trip data model MUST include the
  associated schools (id, name) from the updated endpoint.

### Key Entities

- **School**: An institution associated with a field trip.
  Attributes: id (UUID), name (string).
- **Field Trip** (updated): Now includes a list of associated
  schools.

## Assumptions

- The field trip endpoint always returns at least one school per
  field trip.
- The school list per field trip is small enough to display in a
  single dropdown without search or pagination.
- No other part of the application depends on the `schoolId` URL
  parameter.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Parents can select a school and complete
  registration without any URL parameter configuration.
- **SC-002**: School selection adds less than 5 seconds to the
  overall registration time.
- **SC-003**: Form validation prevents 100% of submissions
  without a school selection.
- **SC-004**: The dropdown is fully usable on mobile devices
  (320px viewport and above).
