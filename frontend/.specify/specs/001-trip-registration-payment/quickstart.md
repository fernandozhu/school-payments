# Quickstart: School Trip Registration & Payment

**Feature Branch**: `001-trip-registration-payment`
**Date**: 2026-02-12

## Prerequisites

- Node.js LTS (v22+)
- npm or pnpm
- Backend server running at a known URL (see Backend Setup)

## Backend Setup

The Django backend must be running to serve the API endpoints.

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata mockdata.json
python manage.py runserver 8000
```

Backend will be available at `http://localhost:8000`.

## Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`.

## Access the Application

Open the browser and navigate to:

```
http://localhost:5173/?schoolId=a745da7f-c91b-4ff0-9beb-5bc1c82f125c
```

The `schoolId` query parameter identifies which school the parent
is registering from. Use one of the mock school IDs:
- Auckland School: `a745da7f-c91b-4ff0-9beb-5bc1c82f125c`
- Christchurch School: `dbc8c505-c7ea-493f-9159-e0f1d0c6ab96`

## Verify the Flow

1. Main page loads and displays the field trip details
   (location, date, cost).
2. Click "Register" to open the registration modal.
3. Fill in parent info, student info, and payment details.
4. Click "Pay" to submit.
5. Loading spinner appears while payment processes (~1.5s).
6. Success or failure message appears in the modal.

## Test Data

Use these values for testing payment:

| Field       | Valid Value          |
|-------------|----------------------|
| Card Number | 1234567890123456     |
| Expiry Date | 12/27                |
| CVV         | 123                  |

Note: The backend has a 10% simulated failure rate for payments.
Retry if you receive a failure.

## Build for Production

```bash
npm run build
npm run preview
```

The `VITE_API_BASE_URL` environment variable must be set at
build time since Vite inlines environment variables during the
build process.
