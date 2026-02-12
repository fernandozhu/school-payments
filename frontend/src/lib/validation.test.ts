import { describe, it, expect } from "vitest";
import { validateField, validatePaymentForm, hasErrors } from "./validation";

describe("validateField", () => {
  describe("school_id", () => {
    it("returns error when empty", () => {
      expect(validateField("school_id", "")).toBe("School is required");
    });

    it("returns error when whitespace only", () => {
      expect(validateField("school_id", "   ")).toBe("School is required");
    });

    it("returns undefined when valid", () => {
      expect(validateField("school_id", "abc-123")).toBeUndefined();
    });
  });

  describe("parent_first_name", () => {
    it("returns error when empty", () => {
      expect(validateField("parent_first_name", "")).toBe(
        "Parent first name is required",
      );
    });

    it("returns error when whitespace only", () => {
      expect(validateField("parent_first_name", "  ")).toBe(
        "Parent first name is required",
      );
    });

    it("returns undefined when valid", () => {
      expect(validateField("parent_first_name", "Jane")).toBeUndefined();
    });
  });

  describe("parent_last_name", () => {
    it("returns error when empty", () => {
      expect(validateField("parent_last_name", "")).toBe(
        "Parent last name is required",
      );
    });

    it("returns undefined when valid", () => {
      expect(validateField("parent_last_name", "Doe")).toBeUndefined();
    });
  });

  describe("email", () => {
    it("returns error when empty", () => {
      expect(validateField("email", "")).toBe("Email is required");
    });

    it("returns error for invalid format", () => {
      expect(validateField("email", "notanemail")).toBe(
        "Enter a valid email address",
      );
    });

    it("returns error for missing domain", () => {
      expect(validateField("email", "user@")).toBe(
        "Enter a valid email address",
      );
    });

    it("returns undefined for valid email", () => {
      expect(validateField("email", "user@example.com")).toBeUndefined();
    });
  });

  describe("student_first_name", () => {
    it("returns error when empty", () => {
      expect(validateField("student_first_name", "")).toBe(
        "Student first name is required",
      );
    });

    it("returns undefined when valid", () => {
      expect(validateField("student_first_name", "Alice")).toBeUndefined();
    });
  });

  describe("student_last_name", () => {
    it("returns error when empty", () => {
      expect(validateField("student_last_name", "")).toBe(
        "Student last name is required",
      );
    });

    it("returns undefined when valid", () => {
      expect(validateField("student_last_name", "Smith")).toBeUndefined();
    });
  });

  describe("card_number", () => {
    it("returns error when empty", () => {
      expect(validateField("card_number", "")).toBe("Card number is required");
    });

    it("returns error for non-16-digit value", () => {
      expect(validateField("card_number", "12345")).toBe(
        "Card number must be exactly 16 digits",
      );
    });

    it("returns error for letters", () => {
      expect(validateField("card_number", "abcd1234abcd1234")).toBe(
        "Card number must be exactly 16 digits",
      );
    });

    it("returns undefined for valid 16-digit number", () => {
      expect(
        validateField("card_number", "1234567890123456"),
      ).toBeUndefined();
    });
  });

  describe("expiry_date", () => {
    it("returns error when empty", () => {
      expect(validateField("expiry_date", "")).toBe("Expiry date is required");
    });

    it("returns error for invalid format", () => {
      expect(validateField("expiry_date", "1234")).toBe(
        "Enter a valid date in MM/YY format",
      );
    });

    it("returns error for invalid month 00/25", () => {
      expect(validateField("expiry_date", "00/25")).toBe(
        "Enter a valid date in MM/YY format",
      );
    });

    it("returns error for invalid month 13/25", () => {
      expect(validateField("expiry_date", "13/25")).toBe(
        "Enter a valid date in MM/YY format",
      );
    });

    it("returns undefined for valid MM/YY", () => {
      expect(validateField("expiry_date", "12/25")).toBeUndefined();
    });

    it("returns undefined for month 01", () => {
      expect(validateField("expiry_date", "01/30")).toBeUndefined();
    });
  });

  describe("cvv", () => {
    it("returns error when empty", () => {
      expect(validateField("cvv", "")).toBe("CVV is required");
    });

    it("returns error for non-3-digit value", () => {
      expect(validateField("cvv", "12")).toBe("CVV must be exactly 3 digits");
    });

    it("returns error for 4 digits", () => {
      expect(validateField("cvv", "1234")).toBe(
        "CVV must be exactly 3 digits",
      );
    });

    it("returns error for letters", () => {
      expect(validateField("cvv", "abc")).toBe("CVV must be exactly 3 digits");
    });

    it("returns undefined for valid 3-digit CVV", () => {
      expect(validateField("cvv", "123")).toBeUndefined();
    });
  });

  describe("unknown field", () => {
    it("returns undefined for unrecognized field names", () => {
      expect(validateField("unknown_field", "")).toBeUndefined();
    });
  });
});

describe("validatePaymentForm", () => {
  const validForm = {
    school_id: "school-1",
    parent_first_name: "Jane",
    parent_last_name: "Doe",
    email: "jane@example.com",
    student_first_name: "Alice",
    student_last_name: "Doe",
    card_number: "1234567890123456",
    expiry_date: "12/25",
    cvv: "123",
    field_trip_id: "trip-1",
  };

  it("returns no errors for a valid form", () => {
    const errors = validatePaymentForm(validForm);
    expect(hasErrors(errors)).toBe(false);
  });

  it("returns errors for all empty fields", () => {
    const errors = validatePaymentForm({});
    expect(errors.school_id).toBeDefined();
    expect(errors.parent_first_name).toBeDefined();
    expect(errors.parent_last_name).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.student_first_name).toBeDefined();
    expect(errors.student_last_name).toBeDefined();
    expect(errors.card_number).toBeDefined();
    expect(errors.expiry_date).toBeDefined();
    expect(errors.cvv).toBeDefined();
  });

  it("returns error only for the invalid field", () => {
    const errors = validatePaymentForm({
      ...validForm,
      email: "bad-email",
    });
    expect(errors.email).toBe("Enter a valid email address");
    expect(errors.parent_first_name).toBeUndefined();
    expect(errors.card_number).toBeUndefined();
  });
});

describe("hasErrors", () => {
  it("returns false for empty object", () => {
    expect(hasErrors({})).toBe(false);
  });

  it("returns false when all values are undefined", () => {
    expect(hasErrors({ email: undefined, cvv: undefined })).toBe(false);
  });

  it("returns true when any value is a string", () => {
    expect(hasErrors({ email: "Email is required" })).toBe(true);
  });
});
