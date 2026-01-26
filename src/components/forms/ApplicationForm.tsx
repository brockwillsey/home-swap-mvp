"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

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
import { ProfilePhotoUpload } from "./ProfilePhotoUpload";
import { HomePhotosUpload } from "./HomePhotosUpload";
import { applicationFormSchema, type ApplicationFormData } from "~/lib/validations/application";
import { api } from "~/trpc/react";

/**
 * Application Form Component
 *
 * Membership application form for Art Res.
 * Uses React Hook Form + Zod validation.
 * Submits via tRPC mutation.
 */
export function ApplicationForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      name: "",
      email: "",
      bio: "",
      location: "",
      studioGalleryReferral: "",
      reasonForJoining: "",
      profilePhotoUrl: "",
      homePhotos: [],
    },
  });

  const createApplication = api.application.create.useMutation({
    onSuccess: (data, variables) => {
      setSubmitSuccess(true);
      setSubmitError(null);
      // Redirect to sign-in page with callback to payment
      // User signs in with the email they provided, then completes payment
      const encodedEmail = encodeURIComponent(variables.email);
      router.push(`/auth/signin?callbackUrl=/apply/payment&email=${encodedEmail}`);
    },
    onError: (error) => {
      setSubmitError(error.message);
      setSubmitSuccess(false);
    },
  });

  async function onSubmit(data: ApplicationFormData) {
    setSubmitError(null);
    createApplication.mutate(data);
  }

  const isSubmitting = createApplication.isPending;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Join Art Res</CardTitle>
        <CardDescription>
          Apply to become a member of our curated home exchange community for creatives.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Success message */}
        {submitSuccess && (
          <div className="mb-6 rounded-lg bg-green-500/10 p-4 text-center text-green-700 dark:text-green-400">
            <p className="font-medium">Application saved successfully!</p>
            <p className="mt-1 text-sm">Redirecting to sign in and complete payment...</p>
          </div>
        )}

        {/* Error message */}
        {submitError && (
          <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-center text-sm text-destructive">
            {submitError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Photo */}
            <FormField
              control={form.control}
              name="profilePhotoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Photo *</FormLabel>
                  <FormControl>
                    <ProfilePhotoUpload
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    A clear photo of yourself helps build trust in our community.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name and Email row */}
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your full name"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="City, Country"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Where are you based? This helps members find exchanges.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About You *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself, your background, and what you do..."
                      className="min-h-[120px] resize-y"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum 50 characters. Help other members get to know you.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Studio/Gallery Referral */}
            <FormField
              control={form.control}
              name="studioGalleryReferral"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Studio or Gallery Referral *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Is there a studio or gallery close to your place that might be interested in being part of the Art Res community? If so, please share their name and any contact information you have."
                      className="min-h-[100px] resize-y"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Help us grow our community by sharing nearby creative spaces that might want to join.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Home Photos */}
            <FormField
              control={form.control}
              name="homePhotos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Home *</FormLabel>
                  <FormControl>
                    <HomePhotosUpload
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload at least 3 photos of your home. This helps admins assess your property for our community.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason for Joining */}
            <FormField
              control={form.control}
              name="reasonForJoining"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why do you want to join Art Res? *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What draws you to our community? How would you like to participate?"
                      className="min-h-[100px] resize-y"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Help us understand what you&apos;re looking for in a home exchange community.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Submitting Application...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>

            {/* Footer note */}
            <p className="text-center text-xs text-muted-foreground">
              By submitting, you agree to our Terms of Service and Privacy Policy.
              After submission, you&apos;ll complete the $300 annual membership payment.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
