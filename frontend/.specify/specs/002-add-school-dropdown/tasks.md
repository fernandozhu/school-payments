# Tasks: Add School Dropdown to Registration

**Input**: Design documents from `.specify/specs/002-add-school-dropdown/`
**Prerequisites**: spec.md (required), existing codebase from feature 001

**Tests**: Not explicitly requested. Test tasks omitted.

**Organization**: Tasks modify existing files from the trip registration feature. Grouped by user story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Web app frontend**: `frontend/src/`

---

## Phase 1: Setup

**Purpose**: Install required UI component

- [x] T001 Install shadcn/ui select component by running `npx shadcn@latest add select` from `frontend/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Update shared types and validation that both user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Update `frontend/src/types/index.ts`: Add a `School` interface with `id: string` and `name: string`. Update `FieldTrip` interface to include `schools: School[]`. Update the `FormErrors` type to remove `school_id` from the `Omit` exclusion list so that `school_id` becomes a validatable field (change `Omit<PaymentRequest, "field_trip_id" | "school_id">` to `Omit<PaymentRequest, "field_trip_id">`).
- [x] T003 Update `frontend/src/lib/validation.ts`: Add `school_id` to the `ValidatableField` type (update the Omit to only exclude `field_trip_id`). Add a `school_id` entry to `fieldValidators` that returns `"School is required"` when the value is empty/untrimmed.

**Checkpoint**: Types and validation now support school_id as a validated form field.

---

## Phase 3: User Story 1 — Select School During Registration (Priority: P1)

**Goal**: Add a mandatory school dropdown to the registration modal, populated from the field trip's schools array. Auto-select when only one school exists.

**Independent Test**: Open the registration modal, verify school dropdown shows all school names, try submitting without selection (blocked), select a school and submit (school_id included in request).

### Implementation for User Story 1

- [x] T004 [US1] Update `frontend/src/components/RegistrationModal.tsx`: (1) Remove the `schoolId` prop from `RegistrationModalProps`. (2) Update `createEmptyForm` to accept only `fieldTrip: FieldTrip` — set `school_id` to the first school's ID if `fieldTrip.schools.length === 1`, otherwise set to `""`. (3) Import the shadcn `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` components. (4) Add a "School" section at the top of the form (before Parent Information) with a `Label` for "School" and a `Select` component: the `SelectTrigger` should show "Select a school" as placeholder; each `SelectItem` has `value={school.id}` and displays `school.name`; on value change, call `handleChange("school_id", value)` and clear the school_id error. (5) Display the school_id validation error below the select using the same pattern as other fields (red text with `id="school_id-error"`, `aria-describedby` on the trigger). (6) Update `handleClose` to use the updated `createEmptyForm(fieldTrip)` without schoolId. (7) The select must be disabled when `submitting` is true (it's inside the `fieldset[disabled]` so this should work automatically). (8) Import `School` type from `@/types` if needed for type safety.

**Checkpoint**: School dropdown is functional, validates on submit, auto-selects single school.

---

## Phase 4: User Story 2 — Remove School ID from URL (Priority: P2)

**Goal**: Remove the `schoolId` URL query parameter reading from App.tsx and stop passing it to RegistrationModal.

**Independent Test**: Load the page without any query parameters — field trip displays normally and registration works with school selected via dropdown.

### Implementation for User Story 2

- [x] T005 [US2] Update `frontend/src/App.tsx`: (1) Remove the `schoolId` constant that reads from `URLSearchParams`. (2) Remove the `schoolId={schoolId}` prop from the `RegistrationModal` component usage. (3) Remove the unused import of `useState` for `fetchKey` if no longer needed (it is still needed). Just remove the schoolId-related lines.

**Checkpoint**: App no longer depends on URL parameters. Full flow works with dropdown only.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verify build, lint, and update documentation

- [x] T006 Run TypeScript compilation (`npx tsc -b --noEmit`) and ESLint (`npx eslint src/ --ignore-pattern 'src/components/ui/**'`) to verify zero errors. Fix any issues found.
- [x] T007 Run production build (`npx vite build`) to verify bundle compiles successfully.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (Select component installed)
- **User Story 1 (Phase 3)**: Depends on Phase 2 (types and validation updated)
- **User Story 2 (Phase 4)**: Depends on Phase 3 (RegistrationModal no longer expects schoolId prop)
- **Polish (Phase 5)**: Depends on all user stories being complete

### Execution Order

```text
T001 → T002 ∥ T003 → T004 → T005 → T006 ∥ T007
```

### Parallel Opportunities

```text
# Phase 2 parallel tasks:
T002 (types/index.ts) ∥ T003 (lib/validation.ts)

# Phase 5 parallel tasks:
T006 (lint check) ∥ T007 (build check)
```

---

## Implementation Strategy

### Sequential Delivery

1. Install Select component (T001)
2. Update types + validation (T002–T003)
3. Add dropdown to modal (T004) — **validates independently**
4. Remove URL param (T005) — **completes the feature**
5. Verify quality (T006–T007)

---

## Notes

- This is a modification to existing feature 001 code, not a greenfield implementation
- Only 4 source files are modified: types/index.ts, lib/validation.ts, RegistrationModal.tsx, App.tsx
- One new shadcn component installed: Select
- The FieldTrip type change affects fetchFieldTrips() return type but no API service code changes are needed (the response shape now includes `schools`)
