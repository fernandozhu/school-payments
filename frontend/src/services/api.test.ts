import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchFieldTrips, submitPayment } from "./api";
import type { PaymentRequest } from "@/types";

const mockPaymentRequest: PaymentRequest = {
  parent_first_name: "Jane",
  parent_last_name: "Doe",
  email: "jane@example.com",
  student_first_name: "Alice",
  student_last_name: "Doe",
  card_number: "1234567890123456",
  expiry_date: "12/25",
  cvv: "123",
  field_trip_id: "trip-1",
  school_id: "school-1",
};

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchFieldTrips", () => {
  it("returns field trips on success", async () => {
    const trips = [{ id: "1", location: "Zoo", cost: 20, date: "2026-10-10T00:00:00Z", schools: [] }];
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(trips),
    } as Response);

    const result = await fetchFieldTrips();
    expect(result).toEqual(trips);
  });

  it("throws on non-ok response", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    await expect(fetchFieldTrips()).rejects.toThrow(
      "Failed to load field trip information. Please try again.",
    );
  });
});

describe("submitPayment", () => {
  it("returns success with data on 201", async () => {
    const responseData = { id: "1", date: "2026-01-01", amount: "20.00", student: 1, activity: "Zoo" };
    vi.mocked(fetch).mockResolvedValue({
      status: 201,
      json: () => Promise.resolve(responseData),
    } as unknown as Response);

    const result = await submitPayment(mockPaymentRequest);
    expect(result).toEqual({ success: true, data: responseData });
  });

  it("sends correct request headers and body", async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 201,
      json: () => Promise.resolve({}),
    } as unknown as Response);

    await submitPayment(mockPaymentRequest);

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockPaymentRequest),
      }),
    );
  });

  it("returns first error message on 400", async () => {
    const errors = { email: ["Invalid email address"] };
    vi.mocked(fetch).mockResolvedValue({
      status: 400,
      json: () => Promise.resolve(errors),
    } as unknown as Response);

    const result = await submitPayment(mockPaymentRequest);
    expect(result).toEqual({
      success: false,
      errors,
      message: "Invalid email address",
    });
  });

  it("returns fallback message on 400 with empty errors", async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 400,
      json: () => Promise.resolve({}),
    } as unknown as Response);

    const result = await submitPayment(mockPaymentRequest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toBe("Please check your information and try again.");
    }
  });

  it("returns generic error on other status codes", async () => {
    vi.mocked(fetch).mockResolvedValue({
      status: 500,
    } as Response);

    const result = await submitPayment(mockPaymentRequest);
    expect(result).toEqual({
      success: false,
      message: "Payment processing failed. Please try again.",
    });
  });

  it("returns network error on fetch failure", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"));

    const result = await submitPayment(mockPaymentRequest);
    expect(result).toEqual({
      success: false,
      message: "Network error. Please check your connection and try again.",
    });
  });
});
