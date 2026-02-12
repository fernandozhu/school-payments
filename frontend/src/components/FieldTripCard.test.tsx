import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FieldTripCard } from "./FieldTripCard";
import type { FieldTrip } from "@/types";

const fieldTrip: FieldTrip = {
  id: "trip-1",
  location: "Auckland Zoo",
  cost: 20,
  date: "2026-10-10T00:00:00Z",
  schools: [{ id: "s1", name: "Auckland School" }],
};

describe("FieldTripCard", () => {
  it("displays the trip location", () => {
    render(<FieldTripCard fieldTrip={fieldTrip} onRegister={() => {}} />);
    const matches = screen.getAllByText("Auckland Zoo");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("displays formatted date in en-NZ locale", () => {
    render(<FieldTripCard fieldTrip={fieldTrip} onRegister={() => {}} />);
    // en-NZ format: "Saturday, 10 October 2026"
    expect(screen.getByText(/10 October 2026/)).toBeInTheDocument();
  });

  it("displays formatted cost in NZD", () => {
    render(<FieldTripCard fieldTrip={fieldTrip} onRegister={() => {}} />);
    expect(screen.getByText("$20.00")).toBeInTheDocument();
  });

  it("calls onRegister when Register button is clicked", async () => {
    const onRegister = vi.fn();
    render(<FieldTripCard fieldTrip={fieldTrip} onRegister={onRegister} />);

    await userEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(onRegister).toHaveBeenCalledOnce();
  });
});
