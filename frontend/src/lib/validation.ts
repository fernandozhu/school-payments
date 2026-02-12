import type { PaymentRequest, FormErrors } from "@/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CARD_PATTERN = /^\d{16}$/;
const EXPIRY_PATTERN = /^(0[1-9]|1[0-2])\/\d{2}$/;
const CVV_PATTERN = /^\d{3}$/;

type ValidatableField = keyof Omit<PaymentRequest, "field_trip_id" | "school_id">;

const fieldValidators: Record<ValidatableField, (value: string) => string | undefined> = {
  parent_first_name: (v) =>
    v.trim() ? undefined : "Parent first name is required",
  parent_last_name: (v) =>
    v.trim() ? undefined : "Parent last name is required",
  email: (v) => {
    if (!v.trim()) return "Email is required";
    if (!EMAIL_PATTERN.test(v)) return "Enter a valid email address";
    return undefined;
  },
  student_first_name: (v) =>
    v.trim() ? undefined : "Student first name is required",
  student_last_name: (v) =>
    v.trim() ? undefined : "Student last name is required",
  card_number: (v) => {
    if (!v.trim()) return "Card number is required";
    if (!CARD_PATTERN.test(v)) return "Card number must be exactly 16 digits";
    return undefined;
  },
  expiry_date: (v) => {
    if (!v.trim()) return "Expiry date is required";
    if (!EXPIRY_PATTERN.test(v)) return "Enter a valid date in MM/YY format";
    return undefined;
  },
  cvv: (v) => {
    if (!v.trim()) return "CVV is required";
    if (!CVV_PATTERN.test(v)) return "CVV must be exactly 3 digits";
    return undefined;
  },
};

export function validateField(
  field: string,
  value: string,
): string | undefined {
  const validator = fieldValidators[field as ValidatableField];
  if (!validator) return undefined;
  return validator(value);
}

export function validatePaymentForm(
  data: Partial<PaymentRequest>,
): FormErrors {
  const errors: FormErrors = {};

  for (const [field, validator] of Object.entries(fieldValidators)) {
    const value = data[field as keyof PaymentRequest] ?? "";
    const error = validator(value);
    if (error) {
      errors[field as ValidatableField] = error;
    }
  }

  return errors;
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some((e) => e !== undefined);
}
