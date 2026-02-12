import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

vi.mock("@/services/api", () => ({
  fetchFieldTrips: vi.fn(),
}));

// Mock child components to isolate App logic
vi.mock("@/components/FieldTripCard", () => ({
  FieldTripCard: ({ fieldTrip, onRegister }: { fieldTrip: { location: string }; onRegister: () => void }) => (
    <div data-testid="field-trip-card">
      <span>{fieldTrip.location}</span>
      <button onClick={onRegister}>Register</button>
    </div>
  ),
}));

vi.mock("@/components/RegistrationModal", () => ({
  RegistrationModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="registration-modal">Modal Open</div> : null,
}));

import { fetchFieldTrips } from "@/services/api";

const mockTrip = {
  id: "trip-1",
  location: "Auckland Zoo",
  cost: 20,
  date: "2026-10-10T00:00:00Z",
  schools: [{ id: "s1", name: "Auckland School" }],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("App", () => {
  it("shows loading state initially", () => {
    vi.mocked(fetchFieldTrips).mockReturnValue(new Promise(() => {}));
    render(<App />);
    expect(screen.getByText("Loading field trip details...")).toBeInTheDocument();
  });

  it("shows field trip card on successful fetch", async () => {
    vi.mocked(fetchFieldTrips).mockResolvedValue([mockTrip]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId("field-trip-card")).toBeInTheDocument();
    });
    expect(screen.getByText("Auckland Zoo")).toBeInTheDocument();
  });

  it("shows the School Trip heading on success", async () => {
    vi.mocked(fetchFieldTrips).mockResolvedValue([mockTrip]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("School Trip")).toBeInTheDocument();
    });
  });

  it("shows empty state when no trips returned", async () => {
    vi.mocked(fetchFieldTrips).mockResolvedValue([]);
    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText("No field trips available at this time."),
      ).toBeInTheDocument();
    });
  });

  it("shows error message on fetch failure", async () => {
    vi.mocked(fetchFieldTrips).mockRejectedValue(new Error("Network error"));
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("shows Try Again button on error and retries on click", async () => {
    vi.mocked(fetchFieldTrips)
      .mockRejectedValueOnce(new Error("Failed"))
      .mockResolvedValueOnce([mockTrip]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Failed")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /try again/i }));

    await waitFor(() => {
      expect(screen.getByTestId("field-trip-card")).toBeInTheDocument();
    });
    expect(fetchFieldTrips).toHaveBeenCalledTimes(2);
  });

  it("opens registration modal when Register is clicked", async () => {
    vi.mocked(fetchFieldTrips).mockResolvedValue([mockTrip]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId("field-trip-card")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("registration-modal")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(screen.getByTestId("registration-modal")).toBeInTheDocument();
  });
});
