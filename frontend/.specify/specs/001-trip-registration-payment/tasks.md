# Tasks: School Trip Registration & Payment

**Input**: Design documents from `.specify/specs/001-trip-registration-payment/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app frontend**: `frontend/src/`
- shadcn/ui components: `frontend/src/components/ui/`
- Custom components: `frontend/src/components/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Environment configuration, shadcn/ui component installation, shared types and config

- [x] T001 Create environment file at `frontend/.env` with `VITE_API_BASE_URL=http://localhost:8000`
- [x] T002 Install shadcn/ui components (card, dialog, input, label) by running `npx shadcn@latest add card dialog input label` from `frontend/`
- [x] T003 [P] Create API configuration module at `frontend/src/config.ts` that reads `VITE_API_BASE_URL` from `import.meta.env` and exports an `API_ENDPOINTS` object with `fieldTrips` (`${BASE_URL}/api/fieldtrip`) and `payment` (`${BASE_URL}/api/payment`) endpoint constants
- [x] T004 [P] Create shared TypeScript types at `frontend/src/types/index.ts` defining: `FieldTrip` (id, location, cost, date), `PaymentRequest` (student_first_name, student_last_name, parent_first_name, parent_last_name, email, field_trip_id, school_id, card_number, expiry_date, cvv), `PaymentResponse` (id, date, amount, student, activity), `ApiError` (field-level error map from 400 responses), and `FormErrors` (optional string per form field)

**Checkpoint**: Configuration and types ready. T003 and T004 can run in parallel since they touch different files.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API service layer and validation logic that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create API service module at `frontend/src/services/api.ts` with two functions: `fetchFieldTrips()` that sends GET to `API_ENDPOINTS.fieldTrips` and returns `FieldTrip[]`, and `submitPayment(data: PaymentRequest)` that sends POST to `API_ENDPOINTS.payment` with JSON body and returns the response (handling 201 success, 400 validation errors, and 500 server errors). Both functions must use the native `fetch` API and the types from `src/types/index.ts`. Import endpoint URLs from `src/config.ts`.
- [x] T006 [P] Create form validation module at `frontend/src/lib/validation.ts` with a `validatePaymentForm(data: Partial<PaymentRequest>)` function that returns `FormErrors`. Validation rules: all name fields required and non-empty; email must match standard email pattern; card_number must be exactly 16 digits; expiry_date must match MM/YY format with month 01-12; cvv must be exactly 3 digits. Also export a `validateField(field: string, value: string)` function for single-field validation on blur.

**Checkpoint**: Foundation ready — API client and validation logic available for all user stories.

---

## Phase 3: User Story 1 — View Field Trip Details (Priority: P1) MVP

**Goal**: Parent visits the main page and sees field trip information (location, date, cost) with a "Register" button. Loading and error states are handled.

**Independent Test**: Load the page → field trip details visible → Register button present and clickable. Error state shows retry button. Loading state shows spinner.

### Implementation for User Story 1

- [x] T007 [US1] Create `FieldTripCard` component at `frontend/src/components/FieldTripCard.tsx`. Props: `fieldTrip: FieldTrip`, `onRegister: () => void`. Uses shadcn `Card` (CardHeader, CardTitle, CardContent, CardFooter) to display the trip location as the title, formatted date, and cost (formatted as currency). Renders a shadcn `Button` labeled "Register" in the CardFooter that calls `onRegister`. Style with TailwindCSS utility classes, mobile-first responsive layout. The card should be centered on the page with a max-width appropriate for readability.
- [x] T008 [US1] Update `frontend/src/App.tsx` to: (1) Read `schoolId` from URL query parameters using `URLSearchParams`. (2) Fetch field trip data on mount using `fetchFieldTrips()` from `src/services/api.ts`. (3) Manage page state: loading (show `Loader2` spinner from lucide-react with `animate-spin`), error (show error message with a "Try Again" button that re-fetches), success (render `FieldTripCard` for the first field trip in the response array). (4) Store `schoolId` and the selected `fieldTrip` in state for use by the registration modal. (5) Add a `modalOpen` boolean state and pass `onRegister` callback to `FieldTripCard` that sets it to true. (6) Remove the existing placeholder content and the `App.css` import. Use TailwindCSS classes for page layout (centered content, padding, min-height screen).

**Checkpoint**: Main page displays field trip info with loading/error states and a working Register button. MVP is independently functional.

---

## Phase 4: User Story 2 — Register and Submit Payment (Priority: P2)

**Goal**: Parent clicks Register, a modal opens with a form collecting parent info (first/last name, email), student info (first/last name), and payment info (card number, expiry, CVV). Form validates on blur and submit. On submit, a loading spinner shows while the payment is processed.

**Independent Test**: Click Register → modal opens → fill form → see validation errors for invalid input → fix errors → submit → loading spinner appears and form becomes non-interactive.

### Implementation for User Story 2

- [x] T009 [US2] Create `RegistrationModal` component at `frontend/src/components/RegistrationModal.tsx`. Props: `open: boolean`, `onOpenChange: (open: boolean) => void`, `fieldTrip: FieldTrip`, `schoolId: string`. Uses shadcn `Dialog` (DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter). Contains a form with three sections using shadcn `Input` and `Label` components: (a) Parent Information — parent_first_name, parent_last_name, email; (b) Student Information — student_first_name, student_last_name; (c) Payment Details — card_number (maxLength 16), expiry_date (placeholder "MM/YY"), cvv (maxLength 3). Manages form state with `useState` for `PaymentRequest` fields (auto-populate field_trip_id from `fieldTrip.id` and school_id from prop). Manages `FormErrors` state. Calls `validateField()` on blur for each field and `validatePaymentForm()` on submit. Displays inline error messages below each invalid field using red text. On valid submit: sets a `submitting` boolean state to true, disables all inputs and the submit button, shows `Loader2` icon with `animate-spin` on the submit button, calls `submitPayment()` from the API service. The modal MUST NOT close while submitting. The DialogDescription should show the trip location and cost. The form must be scrollable on mobile viewports.
- [x] T010 [US2] Wire `RegistrationModal` into `frontend/src/App.tsx` by importing the component and rendering it with `open={modalOpen}`, `onOpenChange={setModalOpen}`, `fieldTrip={selectedFieldTrip}`, and `schoolId={schoolId}`. The modal should only render when `fieldTrip` data is available (not during loading or error states).

**Checkpoint**: Full registration form flow works — modal opens, validates input, submits payment with loading state.

---

## Phase 5: User Story 3 — View Payment Result (Priority: P3)

**Goal**: After payment is processed, the modal shows either a success confirmation (with transaction details) or a failure message with a retry option.

**Independent Test**: Submit payment → on success: see confirmation with trip details → close modal. Submit payment → on failure: see error message → click retry to return to form → resubmit.

### Implementation for User Story 3

- [x] T011 [P] [US3] Create `PaymentResult` component at `frontend/src/components/PaymentResult.tsx`. Props: `success: boolean`, `tripLocation: string`, `amount: number`, `errorMessage?: string`, `onClose: () => void`, `onRetry: () => void`. When `success` is true: display a success icon (`CircleCheck` from lucide-react in green), a "Payment Successful" heading, confirmation text with the trip location and amount, and a "Done" button that calls `onClose`. When `success` is false: display an error icon (`CircleX` from lucide-react in red), a "Payment Failed" heading, the error message text, and two buttons — "Try Again" (calls `onRetry`) and "Close" (calls `onClose`). Style with TailwindCSS, centered text layout, appropriate spacing.
- [x] T012 [US3] Integrate `PaymentResult` into `RegistrationModal` at `frontend/src/components/RegistrationModal.tsx`. Add a `paymentResult` state of type `{ success: boolean; errorMessage?: string } | null`, initially null. After `submitPayment()` resolves: if HTTP 201, set `paymentResult` to `{ success: true }`; if HTTP 400/500 or network error, set `paymentResult` to `{ success: false, errorMessage: <extracted message> }` and set `submitting` to false. When `paymentResult` is not null, render `PaymentResult` instead of the form inside the Dialog. The `onRetry` handler resets `paymentResult` to null (returning to the form). The `onClose` handler resets all form state, resets `paymentResult`, and calls `onOpenChange(false)`. The dialog should not be closeable via outside click or escape key while `submitting` is true.

**Checkpoint**: All three user stories are complete and independently functional. Full flow: view trip → register → pay → see result.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, responsive verification, accessibility

- [x] T013 Delete unused `frontend/src/App.css` file (was replaced by TailwindCSS utilities in T008)
- [x] T014 [P] Verify responsive layout of all components at breakpoints 320px, 768px, 1024px, 1280px. Ensure the modal form is scrollable on small viewports, touch targets are at least 44x44px, and the FieldTripCard scales appropriately. Adjust TailwindCSS classes in `FieldTripCard.tsx`, `RegistrationModal.tsx`, and `App.tsx` as needed.
- [x] T015 [P] Verify accessibility: all form inputs have associated labels (via `htmlFor`), focus indicators are visible, the modal traps focus when open, error messages are associated with fields via `aria-describedby`, and the submit button has appropriate `aria-busy` when submitting. Adjust components as needed.
- [x] T016 Run quickstart.md validation: start the backend server, start the frontend dev server, navigate to `http://localhost:5173/?schoolId=a745da7f-c91b-4ff0-9beb-5bc1c82f125c`, and verify the complete flow described in `quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion (T003, T004 must be done for imports) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion (T005 for API service)
- **User Story 2 (Phase 4)**: Depends on Phase 3 completion (T008 provides modal state and props)
- **User Story 3 (Phase 5)**: T011 can start after Phase 2 (standalone component). T012 depends on T009 (modifies RegistrationModal)
- **Polish (Phase 6)**: Depends on all user stories being complete

### Within Each Phase

- Phase 1: T001 first → T002 next (needs project to exist) → T003 and T004 in parallel
- Phase 2: T005 and T006 in parallel (different files, both depend only on Phase 1 types)
- Phase 3: T007 first (component) → T008 (wires it into App)
- Phase 4: T009 first (component) → T010 (wires it into App)
- Phase 5: T011 can start in parallel with Phase 4 → T012 after T009

### Parallel Opportunities

```text
# Phase 1 parallel tasks:
T003 (config.ts) ∥ T004 (types/index.ts)

# Phase 2 parallel tasks:
T005 (services/api.ts) ∥ T006 (lib/validation.ts)

# Cross-phase parallel:
T011 (PaymentResult component) can start as soon as Phase 2 is done,
in parallel with Phase 4 work (since it's a standalone component)

# Phase 6 parallel tasks:
T014 (responsive) ∥ T015 (accessibility)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T006)
3. Complete Phase 3: User Story 1 (T007–T008)
4. **STOP and VALIDATE**: Field trip info displays with loading/error states
5. Demo-ready: parents can see trip information

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add User Story 1 → Trip info visible (MVP!)
3. Add User Story 2 → Registration form works, payment submits
4. Add User Story 3 → Success/failure feedback completes the flow
5. Polish → Responsive + accessible + validated

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All paths are relative to the repository root
- shadcn/ui components (T002) are installed via CLI and land in `src/components/ui/`
- The `school_id` comes from URL query param `?schoolId=<uuid>`
- `field_trip_id` is auto-populated from the fetched trip, not user-entered
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
