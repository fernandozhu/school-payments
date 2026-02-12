import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitPayment } from "@/services/api";
import { validateField, validatePaymentForm, hasErrors } from "@/lib/validation";
import type { FieldTrip, PaymentRequest, FormErrors } from "@/types";
import { PaymentResult } from "@/components/PaymentResult";

interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldTrip: FieldTrip;
}

function createEmptyForm(fieldTrip: FieldTrip): PaymentRequest {
  return {
    parent_first_name: "",
    parent_last_name: "",
    email: "",
    student_first_name: "",
    student_last_name: "",
    card_number: "",
    expiry_date: "",
    cvv: "",
    field_trip_id: fieldTrip.id,
    school_id: fieldTrip.schools.length === 1 ? fieldTrip.schools[0].id : "",
  };
}

export function RegistrationModal({
  open,
  onOpenChange,
  fieldTrip,
}: RegistrationModalProps) {
  const [form, setForm] = useState<PaymentRequest>(() =>
    createEmptyForm(fieldTrip),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    errorMessage?: string;
  } | null>(null);

  function handleChange(field: keyof PaymentRequest, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleBlur(field: string) {
    const value = form[field as keyof PaymentRequest] ?? "";
    const error = validateField(field, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formErrors = validatePaymentForm(form);
    setErrors(formErrors);
    if (hasErrors(formErrors)) return;

    setSubmitting(true);
    const result = await submitPayment(form);
    setSubmitting(false);

    if (result.success) {
      setPaymentResult({ success: true });
    } else {
      setPaymentResult({ success: false, errorMessage: result.message });
    }
  }

  function handleRetry() {
    setPaymentResult(null);
  }

  function handleClose() {
    setForm(createEmptyForm(fieldTrip));
    setErrors({});
    setPaymentResult(null);
    setSubmitting(false);
    onOpenChange(false);
  }

  const formattedCost = new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
  }).format(fieldTrip.cost);

  if (paymentResult) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent showCloseButton={false}>
          <PaymentResult
            success={paymentResult.success}
            tripLocation={fieldTrip.location}
            amount={fieldTrip.cost}
            errorMessage={paymentResult.errorMessage}
            onClose={handleClose}
            onRetry={handleRetry}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (submitting) return;
        if (!value) handleClose();
      }}
    >
      <DialogContent
        showCloseButton={!submitting}
        onPointerDownOutside={(e) => {
          if (submitting) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (submitting) e.preventDefault();
        }}
        className="max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>Register for Field Trip</DialogTitle>
          <DialogDescription>
            {fieldTrip.location} — {formattedCost}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset disabled={submitting} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">School</h3>
              <div className="space-y-2">
                <Label htmlFor="school_id">School</Label>
                <Select
                  value={form.school_id}
                  onValueChange={(value) => handleChange("school_id", value)}
                >
                  <SelectTrigger
                    id="school_id"
                    aria-describedby={errors.school_id ? "school_id-error" : undefined}
                    aria-invalid={errors.school_id ? true : undefined}
                  >
                    <SelectValue placeholder="Select a school" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTrip.schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.school_id && (
                  <p id="school_id-error" className="text-sm text-destructive">
                    {errors.school_id}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Parent Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  id="parent_first_name"
                  label="First Name"
                  value={form.parent_first_name}
                  error={errors.parent_first_name}
                  onChange={(v) => handleChange("parent_first_name", v)}
                  onBlur={() => handleBlur("parent_first_name")}
                />
                <FormField
                  id="parent_last_name"
                  label="Last Name"
                  value={form.parent_last_name}
                  error={errors.parent_last_name}
                  onChange={(v) => handleChange("parent_last_name", v)}
                  onBlur={() => handleBlur("parent_last_name")}
                />
              </div>
              <FormField
                id="email"
                label="Email"
                type="email"
                value={form.email}
                error={errors.email}
                onChange={(v) => handleChange("email", v)}
                onBlur={() => handleBlur("email")}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Student Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  id="student_first_name"
                  label="First Name"
                  value={form.student_first_name}
                  error={errors.student_first_name}
                  onChange={(v) => handleChange("student_first_name", v)}
                  onBlur={() => handleBlur("student_first_name")}
                />
                <FormField
                  id="student_last_name"
                  label="Last Name"
                  value={form.student_last_name}
                  error={errors.student_last_name}
                  onChange={(v) => handleChange("student_last_name", v)}
                  onBlur={() => handleBlur("student_last_name")}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Payment Details</h3>
              <FormField
                id="card_number"
                label="Card Number"
                value={form.card_number}
                error={errors.card_number}
                maxLength={16}
                placeholder="1234567890123456"
                onChange={(v) => handleChange("card_number", v)}
                onBlur={() => handleBlur("card_number")}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  id="expiry_date"
                  label="Expiry Date"
                  value={form.expiry_date}
                  error={errors.expiry_date}
                  maxLength={5}
                  placeholder="MM/YY"
                  onChange={(v) => handleChange("expiry_date", v)}
                  onBlur={() => handleBlur("expiry_date")}
                />
                <FormField
                  id="cvv"
                  label="CVV"
                  value={form.cvv}
                  error={errors.cvv}
                  maxLength={3}
                  placeholder="123"
                  onChange={(v) => handleChange("cvv", v)}
                  onBlur={() => handleBlur("cvv")}
                />
              </div>
            </div>
          </fieldset>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} aria-busy={submitting}>
              {submitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {submitting ? "Processing..." : `Pay ${formattedCost}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  error?: string;
  type?: string;
  maxLength?: number;
  placeholder?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

function FormField({
  id,
  label,
  value,
  error,
  type = "text",
  maxLength,
  placeholder,
  onChange,
  onBlur,
}: FormFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
