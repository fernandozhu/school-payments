# Implementation Plan: School Trip Registration & Payment

**Branch**: `001-trip-registration-payment` | **Date**: 2026-02-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-trip-registration-payment/spec.md`

## Summary

Build a single-page school trip registration and payment frontend
using React 19, TypeScript, TailwindCSS v4, and shadcn/ui. The
page displays field trip information fetched from a backend API,
with a registration modal that collects parent/student/payment
data and submits it to a payment endpoint. API base URLs are
externalized to a config file using Vite environment variables.

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode)
**Primary Dependencies**: React 19, shadcn/ui, Radix UI,
TailwindCSS v4, lucide-react
**Storage**: N/A (backend handles persistence)
**Testing**: Vitest + React Testing Library (to be added)
**Target Platform**: Web (mobile-first responsive, 320px–1280px+)
**Project Type**: Web frontend (SPA)
**Performance Goals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
**Constraints**: No additional runtime dependencies beyond what is
already installed. API URLs decoupled via config.
**Scale/Scope**: Single page with one modal, two API endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after
Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Code Quality & Type Safety | All code in strict TypeScript, explicit types for all props and API responses, no `any` | PASS |
| II. Testing Standards | Integration tests for payment flow, co-located test files | PASS (deferred to tasks phase) |
| III. UX Consistency | shadcn/ui for all components, TailwindCSS-only styling, WCAG 2.1 AA, loading/error/empty states | PASS |
| IV. Responsive Design | Mobile-first, 4 breakpoints, 44px touch targets | PASS |

**Post-design re-check**: All gates still pass. No violations
requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-trip-registration-payment/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (frontend/)

```text
frontend/
├── .env                          # VITE_API_BASE_URL
├── src/
│   ├── main.tsx                  # Entry point (existing)
│   ├── App.tsx                   # Root component (modify)
│   ├── index.css                 # Global styles (existing)
│   ├── config.ts                 # NEW: API URL configuration
│   ├── types/
│   │   └── index.ts              # NEW: Shared TypeScript types
│   ├── services/
│   │   └── api.ts                # NEW: API client (fetch wrappers)
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components (existing)
│   │   │   ├── button.tsx        # Existing
│   │   │   ├── card.tsx          # NEW: via shadcn CLI
│   │   │   ├── dialog.tsx        # NEW: via shadcn CLI
│   │   │   ├── input.tsx         # NEW: via shadcn CLI
│   │   │   └── label.tsx         # NEW: via shadcn CLI
│   │   ├── FieldTripCard.tsx     # NEW: Trip info display
│   │   ├── RegistrationModal.tsx # NEW: Form + payment modal
│   │   └── PaymentResult.tsx     # NEW: Success/failure display
│   └── lib/
│       ├── utils.ts              # Existing (cn utility)
│       └── validation.ts         # NEW: Form validation functions
└── tests/                        # Future: test files
```

**Structure Decision**: Single frontend SPA. All source code lives
under `frontend/src/`. Components are organized flat under
`components/` with shadcn/ui primitives in `components/ui/`.
Services layer handles API communication. Types are centralized
in `types/`.

## Key Design Decisions

### 1. API Configuration (from user requirement)

Endpoint URLs are externalized to `src/config.ts` which reads
from `VITE_API_BASE_URL` environment variable:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export const API_ENDPOINTS = {
  fieldTrips: `${API_BASE_URL}/api/fieldtrip`,
  payment: `${API_BASE_URL}/api/payment`,
} as const;
```

### 2. school_id from URL Query Parameter

The `school_id` required by the payment API comes from a URL
query parameter: `?schoolId=<uuid>`. This supports multi-school
access without hardcoding.

### 3. Spec-to-API Reconciliation

The spec describes fields that do not exist in the backend:

| Spec Field | API Reality | Decision |
|------------|-------------|----------|
| Trip name | `location` field only | Use `location` as display name |
| Trip description | Not in API | Omit from UI |
| Parent phone | Not in API | Omit from form |
| Student grade | Not in API | Omit from form |
| Parent full name | Split: first + last | Two input fields |
| Student full name | Split: first + last | Two input fields |
| school_id | Required by API | URL query parameter |

### 4. Component Architecture

- **App.tsx**: Fetches field trip data, manages page-level state
  (loading/error/success), renders FieldTripCard and
  RegistrationModal.
- **FieldTripCard**: Presentational component displaying trip
  info with Register button. Uses shadcn Card.
- **RegistrationModal**: shadcn Dialog containing the form.
  Manages form state, validation, and submission. Contains
  PaymentResult for post-submission feedback.
- **PaymentResult**: Presentational component showing success
  or failure message with appropriate actions.

### 5. No Additional Dependencies

The existing dependency set is sufficient:
- shadcn/ui + Radix UI for all UI components
- lucide-react for icons (Loader2 for spinner)
- TailwindCSS for all styling
- Native fetch API for HTTP requests
- React built-in hooks for state management

## Complexity Tracking

No constitution violations. No complexity justifications needed.
