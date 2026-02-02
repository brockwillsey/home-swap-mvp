"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";

interface DonationFormProps {
  fundId: string;
  fundTitle: string;
  creatorName: string | null;
}

const PRESET_AMOUNTS = [1000, 2500, 5000, 10000]; // in cents

/**
 * Format cents to dollars
 */
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Donation Form Component
 *
 * Allows users to select an amount, add a message, and donate to a fund.
 */
export function DonationForm({ fundId, fundTitle, creatorName }: DonationFormProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const createCheckout = api.donation.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Get final amount (preset or custom)
  const finalAmount = selectedAmount ?? (customAmount ? Math.round(parseFloat(customAmount) * 100) : 0);
  const isValidAmount = finalAmount >= 500; // Minimum $5

  function handleCustomAmountChange(value: string) {
    // Allow only numbers and decimal point
    const sanitized = value.replace(/[^\d.]/g, "");
    // Ensure only one decimal point
    const parts = sanitized.split(".");
    if (parts.length > 2) return;
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) return;

    setCustomAmount(sanitized);
    setSelectedAmount(null);
  }

  function handleSubmit() {
    if (!isValidAmount) {
      toast.error("Minimum donation is $5");
      return;
    }

    createCheckout.mutate({
      fundId,
      amount: finalAmount,
      message: message.trim() || undefined,
      isAnonymous,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support This Project</CardTitle>
        <CardDescription>
          Help {creatorName ?? "this artist"} bring their vision to life
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Amounts */}
        <div className="grid grid-cols-2 gap-2">
          {PRESET_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setSelectedAmount(amount);
                setCustomAmount("");
              }}
              className={`rounded-lg border-2 px-4 py-3 text-center transition-colors ${
                selectedAmount === amount
                  ? "border-primary bg-primary/5 font-semibold text-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {formatCurrency(amount)}
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Or enter a custom amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border bg-background py-2.5 pl-8 pr-3 text-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Minimum donation: $5.00
          </p>
        </div>

        {/* Message */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Add a message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message of support..."
            maxLength={500}
            rows={3}
            className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {message.length}/500 characters
          </p>
        </div>

        {/* Anonymous Option */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm">Make my donation anonymous</span>
        </label>

        {/* Fee Notice */}
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            A 10% platform fee helps maintain Art Res and support our community.
            {finalAmount > 0 && (
              <>
                {" "}
                {creatorName ?? "The artist"} will receive{" "}
                <span className="font-medium text-foreground">
                  {formatCurrency(Math.round(finalAmount * 0.9))}
                </span>
                .
              </>
            )}
          </p>
        </div>

        {/* Submit Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={!isValidAmount || createCheckout.isPending}
        >
          {createCheckout.isPending
            ? "Processing..."
            : isValidAmount
            ? `Donate ${formatCurrency(finalAmount)}`
            : "Select an amount"}
        </Button>
      </CardContent>
    </Card>
  );
}
