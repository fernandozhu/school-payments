import { API_ENDPOINTS } from "@/config";
import type { FieldTrip, PaymentRequest, PaymentResponse, ApiError } from "@/types";

export async function fetchFieldTrips(): Promise<FieldTrip[]> {
  const response = await fetch(API_ENDPOINTS.fieldTrips);

  if (!response.ok) {
    throw new Error("Failed to load field trip information. Please try again.");
  }

  return response.json() as Promise<FieldTrip[]>;
}

export type PaymentResult =
  | { success: true; data: PaymentResponse }
  | { success: false; errors?: ApiError; message: string };

export async function submitPayment(
  data: PaymentRequest,
): Promise<PaymentResult> {
  let response: Response;

  try {
    response = await fetch(API_ENDPOINTS.payment, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    };
  }

  if (response.status === 201) {
    const responseData = (await response.json()) as PaymentResponse;
    return { success: true, data: responseData };
  }

  if (response.status === 400) {
    const errors = (await response.json()) as ApiError;
    const firstError = Object.values(errors).flat()[0];
    return {
      success: false,
      errors,
      message: firstError ?? "Please check your information and try again.",
    };
  }

  return {
    success: false,
    message: "Payment processing failed. Please try again.",
  };
}
