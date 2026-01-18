"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { createListingSchema, type CreateListingInput } from "~/lib/validations/listing";
import { api } from "~/trpc/react";

/**
 * Listing Form Component
 *
 * Form for creating a new home listing.
 * Uses React Hook Form + Zod validation.
 * Submits via tRPC mutation.
 */
export function ListingForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CreateListingInput>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
    },
  });

  const createListing = api.listing.create.useMutation({
    onSuccess: (data) => {
      toast.success("Listing created! Now add some photos.");
      // Redirect to photos step (placeholder for Story 2.2)
      router.push(`/listings/${data.id}/photos`);
    },
    onError: (error) => {
      setSubmitError(error.message);
    },
  });

  async function onSubmit(data: CreateListingInput) {
    setSubmitError(null);
    createListing.mutate(data);
  }

  const isSubmitting = createListing.isPending;
  const titleLength = form.watch("title")?.length ?? 0;
  const descriptionLength = form.watch("description")?.length ?? 0;
  const locationLength = form.watch("location")?.length ?? 0;

  return (
    <div className="space-y-8">
      {/* Form Card */}
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Add Your Home</CardTitle>
          <CardDescription>
            Tell us about your home. You&apos;ll add photos in the next step.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Error message */}
          {submitError && (
            <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-center text-sm text-destructive">
              {submitError}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Cozy Artist Loft in Brooklyn"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription className="flex justify-between">
                      <span>A catchy title for your listing</span>
                      <span className={titleLength > 100 ? "text-destructive" : ""}>
                        {titleLength}/100
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brooklyn, New York"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription className="flex justify-between">
                      <span>City and region where your home is located</span>
                      <span className={locationLength > 200 ? "text-destructive" : ""}>
                        {locationLength}/200
                      </span>
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
                        placeholder="Describe your home, the neighborhood, and what makes it special for creative guests..."
                        className="min-h-[150px] resize-none"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription className="flex justify-between">
                      <span>Help guests understand what your home offers</span>
                      <span className={descriptionLength > 2000 ? "text-destructive" : ""}>
                        {descriptionLength}/2000
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Continue to Photos"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Preview</CardTitle>
          <CardDescription>
            This is how your listing will appear to other members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3 aspect-video w-full rounded-lg bg-muted flex items-center justify-center">
              <span className="text-sm text-muted-foreground">Photos coming next</span>
            </div>
            <h3 className="font-semibold text-foreground">
              {form.watch("title") || "Your listing title"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {form.watch("location") || "Location"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {form.watch("description") || "Your description will appear here..."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
