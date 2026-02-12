import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaymentResult } from "./PaymentResult";

const baseProps = {
  tripLocation: "Auckland Zoo",
  amount: 20,
  onClose: vi.fn(),
  onRetry: vi.fn(),
};

describe("PaymentResult", () => {
  describe("success", () => {
    it("shows success heading", () => {
      render(<PaymentResult {...baseProps} success={true} />);
      expect(screen.getByText("Payment Successful")).toBeInTheDocument();
    });

    it("shows trip location and formatted amount", () => {
      render(<PaymentResult {...baseProps} success={true} />);
      expect(screen.getByText(/Auckland Zoo/)).toBeInTheDocument();
      expect(screen.getByText(/\$20\.00/)).toBeInTheDocument();
    });

    it("shows Done button that calls onClose", async () => {
      const onClose = vi.fn();
      render(<PaymentResult {...baseProps} success={true} onClose={onClose} />);

      await userEvent.click(screen.getByRole("button", { name: /done/i }));
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe("failure", () => {
    it("shows failure heading", () => {
      render(<PaymentResult {...baseProps} success={false} />);
      expect(screen.getByText("Payment Failed")).toBeInTheDocument();
    });

    it("shows provided error message", () => {
      render(
        <PaymentResult
          {...baseProps}
          success={false}
          errorMessage="Card declined"
        />,
      );
      expect(screen.getByText("Card declined")).toBeInTheDocument();
    });

    it("shows default error message when none provided", () => {
      render(<PaymentResult {...baseProps} success={false} />);
      expect(
        screen.getByText("An unexpected error occurred. Please try again."),
      ).toBeInTheDocument();
    });

    it("shows Try Again button that calls onRetry", async () => {
      const onRetry = vi.fn();
      render(
        <PaymentResult {...baseProps} success={false} onRetry={onRetry} />,
      );

      await userEvent.click(screen.getByRole("button", { name: /try again/i }));
      expect(onRetry).toHaveBeenCalledOnce();
    });

    it("shows Close button that calls onClose", async () => {
      const onClose = vi.fn();
      render(
        <PaymentResult {...baseProps} success={false} onClose={onClose} />,
      );

      await userEvent.click(screen.getByRole("button", { name: /close/i }));
      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});
