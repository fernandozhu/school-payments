<!--
Sync Impact Report
===================
Version change: N/A → 1.0.0 (initial adoption)
Modified principles: None (first version)
Added sections:
  - Principle I: Code Quality & Type Safety
  - Principle II: Testing Standards
  - Principle III: User Experience Consistency
  - Principle IV: Responsive Design & Web Best Practices
  - Technology Stack & Constraints
  - Development Workflow & Quality Gates
  - Governance
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md — no update needed (Constitution
    Check section is dynamically filled per feature)
  - .specify/templates/spec-template.md — no update needed (requirements
    and success criteria sections are generic and compatible)
  - .specify/templates/tasks-template.md — no update needed (phase
    structure accommodates testing and polish tasks)
  - .specify/templates/commands/*.md — no command files exist yet
  - .specify/templates/agent-file-template.md — no update needed
    (placeholder structure is compatible)
Follow-up TODOs: None
-->

# School Payments Frontend Constitution

## Core Principles

### I. Code Quality & Type Safety

- All source code MUST be written in TypeScript with strict mode
  enabled (`strict: true` in `tsconfig.json`).
- Explicit `any` types are prohibited. Use `unknown` with type
  guards when the type is genuinely indeterminate.
- Components MUST follow a single-responsibility pattern: one
  exported component per file, co-located with its types.
- Shared types MUST be defined in dedicated type files (e.g.,
  `src/types/`) and imported where needed — never duplicated.
- All props interfaces MUST be explicitly defined and exported.
- ESLint MUST pass with zero warnings before any code is merged.
- Dead code, unused imports, and commented-out code MUST be
  removed before merge.

### II. Testing Standards

- Every user-facing feature MUST include at least one integration
  test that exercises the component in a realistic rendering
  context (e.g., React Testing Library).
- Tests MUST assert on user-visible behavior (text, roles, ARIA
  attributes), never on implementation details (internal state,
  CSS class names, DOM structure).
- Critical user flows (payment submission, form validation, error
  states) MUST have end-to-end coverage.
- Test files MUST be co-located with the component they test using
  the pattern `ComponentName.test.tsx`.
- Mocks MUST be scoped to the test that needs them — global mocks
  are prohibited unless required by a third-party dependency.
- All tests MUST pass before code is merged.

### III. User Experience Consistency

- All UI components MUST use shadcn/ui and Radix UI primitives as
  the foundation. Custom components are permitted only when no
  suitable primitive exists.
- Styling MUST be done exclusively through TailwindCSS utility
  classes. Inline styles and external CSS files are prohibited
  except for global CSS custom properties in `index.css`.
- Design tokens (colors, spacing, radii, typography) MUST be
  sourced from the Tailwind theme configuration — hardcoded
  values are prohibited.
- Interactive elements MUST meet WCAG 2.1 AA accessibility
  standards: proper ARIA labels, keyboard navigability, focus
  indicators, and sufficient color contrast (4.5:1 minimum for
  normal text).
- Loading, empty, and error states MUST be handled for every
  data-dependent view. Users MUST never see a blank screen or
  unhandled error.
- Form validation MUST provide inline, real-time feedback with
  clear error messages tied to the specific field.

### IV. Responsive Design & Web Best Practices

- All layouts MUST follow a mobile-first approach: base styles
  target mobile viewports, with `sm:`, `md:`, `lg:`, and `xl:`
  breakpoints layered progressively.
- Pages MUST render correctly at these minimum breakpoints:
  320px (mobile), 768px (tablet), 1024px (desktop), and
  1280px (wide desktop).
- Touch targets MUST be at least 44x44px on mobile viewports.
- Images and icons MUST use responsive sizing and appropriate
  formats (SVG for icons via lucide-react, optimized raster
  formats for photographs).
- Core Web Vitals targets: LCP < 2.5s, FID < 100ms, CLS < 0.1.
- Bundle size MUST be monitored. Third-party dependencies MUST
  be evaluated for size impact before adoption. Tree-shaking
  MUST be preserved (no barrel file re-exports of entire
  libraries).
- Navigation and layout patterns MUST remain consistent across
  all viewport sizes — restructure layout, never remove
  functionality.

## Technology Stack & Constraints

- **Runtime**: React 19 with React Compiler (babel-plugin-react-compiler)
- **Language**: TypeScript 5.9+ (strict mode)
- **Build**: Vite 7+
- **Styling**: TailwindCSS v4 with `@tailwindcss/vite` plugin
- **Component Library**: shadcn/ui + Radix UI
- **Icons**: lucide-react
- **Linting**: ESLint 9+ with `typescript-eslint` and React plugins
- New dependencies MUST be justified by a concrete need that
  cannot be met by existing dependencies. Prefer composition of
  existing tools over adding new packages.
- Node.js LTS MUST be used for development and CI environments.

## Development Workflow & Quality Gates

- **Pre-commit**: ESLint and TypeScript compilation (`tsc -b`)
  MUST pass.
- **Pre-merge**: All tests MUST pass. No TypeScript errors. No
  ESLint warnings. Responsive layout verified at minimum
  breakpoints.
- **Code review**: Every PR MUST be reviewed for adherence to
  this constitution. Reviewers MUST verify accessibility,
  responsive behavior, and type safety.
- **Component development**: New components MUST include a
  usage example or story demonstrating all variant states
  (default, hover, disabled, error, loading).
- **Commit messages**: MUST follow Conventional Commits format
  (e.g., `feat:`, `fix:`, `refactor:`, `test:`, `docs:`).

## Governance

- This constitution supersedes all other coding practices and
  conventions for this project. When a conflict arises between
  this document and any other guide, this document prevails.
- Amendments require: (1) a written proposal describing the
  change and rationale, (2) review and approval, and (3) a
  migration plan if the change affects existing code.
- Version follows semantic versioning: MAJOR for principle
  removals or incompatible redefinitions, MINOR for new
  principles or material expansions, PATCH for clarifications
  and wording fixes.
- Compliance with these principles MUST be verified during code
  review. Deviations MUST be documented with justification in
  the PR description.

**Version**: 1.0.0 | **Ratified**: 2026-02-12 | **Last Amended**: 2026-02-12
