"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { api } from "~/trpc/react";
import { createFundSchema, type CreateFundInput } from "~/lib/validations/fund";

interface FundFormProps {
  mode: "create" | "edit";
  fundId?: string;
  initialData?: {
    title: string;
    description: string;
    goalAmount: number;
    homeId?: string | null;
    coverImage?: string | null;
  };
  userHomes?: Array<{
    id: string;
    title: string;
    location: string;
  }>;
}

/**
 * Fund Form Component
 *
 * Used for creating and editing crowdfunding campaigns.
 */
export function FundForm({ mode, fundId, initialData, userHomes = [] }: FundFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateFundInput>({
    resolver: zodResolver(createFundSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      goalAmount: initialData?.goalAmount ?? 10000, // Default $100
      homeId: initialData?.homeId ?? undefined,
      coverImage: initialData?.coverImage ?? undefined,
    },
  });

  const createFund = api.fund.create.useMutation({
    onSuccess: (data) => {
      toast.success("Fund created! Add more details or publish when ready.");
      router.push(`/funds/${data.id}/edit`);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsSubmitting(false);
    },
  });

  const updateFund = api.fund.update.useMutation({
    onSuccess: () => {
      toast.success("Fund updated successfully");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
      setIsSubmitting(false);
    },
  });

  async function onSubmit(data: CreateFundInput) {
    setIsSubmitting(true);
    if (mode === "create") {
      createFund.mutate(data);
    } else if (fundId) {
      updateFund.mutate({ id: fundId, ...data });
    }
  }

  // Convert dollars input to cents for storage
  function handleGoalChange(value: string, onChange: (value: number) => void) {
    const dollars = parseFloat(value) || 0;
    const cents = Math.round(dollars * 100);
    onChange(cents);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Support My Artist Residency in Paris"
                  maxLength={100}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Choose a clear, compelling title that describes your project
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell potential supporters about your project, what you plan to create, and how their contribution will help..."
                  rows={6}
                  maxLength={5000}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {field.value.length}/5000 characters. Minimum 50 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Goal Amount */}
        <FormField
          control={form.control}
          name="goalAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fundraising Goal</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    min={100}
                    max={1000000}
                    step={1}
                    placeholder="1000"
                    className="pl-8"
                    value={field.value ? (field.value / 100).toFixed(0) : ""}
                    onChange={(e) => handleGoalChange(e.target.value, field.onChange)}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Set a realistic goal. Minimum $100, maximum $1,000,000.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cover Image URL */}
        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image URL (optional)</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Add a compelling image to represent your project
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Link to Home (optional) */}
        {userHomes.length > 0 && (
          <FormField
            control={form.control}
            name="homeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link to Your Listing (optional)</FormLabel>
                <FormControl>
                  <select
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || undefined)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">No linked listing</option>
                    {userHomes.map((home) => (
                      <option key={home.id} value={home.id}>
                        {home.title} - {home.location}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormDescription>
                  Connect this fund to one of your home listings
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : mode === "create"
              ? "Create Fund"
              : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
