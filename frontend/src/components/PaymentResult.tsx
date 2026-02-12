import { CircleCheck, CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentResultProps {
  success: boolean;
  tripLocation: string;
  amount: number;
  errorMessage?: string;
  onClose: () => void;
  onRetry: () => void;
}

export function PaymentResult({
  success,
  tripLocation,
  amount,
  errorMessage,
  onClose,
  onRetry,
}: PaymentResultProps) {
  const formattedAmount = new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
  }).format(amount);

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <CircleCheck className="h-12 w-12 text-green-600" />
        <h2 className="text-xl font-semibold">Payment Successful</h2>
        <p className="text-muted-foreground">
          Your registration for <strong>{tripLocation}</strong> has been
          confirmed. Amount paid: <strong>{formattedAmount}</strong>.
        </p>
        <Button className="w-full sm:w-auto" onClick={onClose}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <CircleX className="h-12 w-12 text-destructive" />
      <h2 className="text-xl font-semibold">Payment Failed</h2>
      <p className="text-muted-foreground">
        {errorMessage ?? "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        <Button onClick={onRetry}>Try Again</Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
