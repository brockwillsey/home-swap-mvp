"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import {
  applicationFormSchema,
  calculateMembershipFee,
  type ApplicationFormData,
  type MembershipRoleType,
} from "~/lib/validations/application";
import { api } from "~/trpc/react";

/**
 * Application Form Component
 *
 * Membership application form for Art Res with role-based pricing.
 * - Artist with home: $300
 * - Artist without home: $150
 * - Sponsor only: Free
 *
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
      roles: [],
      name: "",
      email: "",
      bio: "",
      location: "",
      portfolioUrl: "",
      studioGalleryReferral: "",
      reasonForJoining: "",
      profilePhotoUrl: "",
      homePhotos: [],
      promoCode: "",
    },
  });

  // Watch roles to show/hide conditional fields and calculate fee
  const selectedRoles = useWatch({ control: form.control, name: "roles" }) as MembershipRoleType[];
  const promoCode = useWatch({ control: form.control, name: "promoCode" }) as string;
  const isArtist = selectedRoles?.includes("ARTIST") ?? false;
  const isHomeOwner = selectedRoles?.includes("HOME_OWNER") ?? false;
  const isSponsorOnly = selectedRoles?.length === 1 && selectedRoles[0] === "SPONSOR";
  const membershipFee = calculateMembershipFee(selectedRoles ?? []);
  const hasValidPromoCode = promoCode?.toUpperCase() === "MUSA-RES-6";

  const createApplication = api.application.create.useMutation({
    onSuccess: (data, variables) => {
      setSubmitSuccess(true);
      setSubmitError(null);

      // Calculate fee for redirect logic
      const fee = calculateMembershipFee(variables.roles as MembershipRoleType[]);

      if (fee === 0) {
        // Sponsor only - skip payment, go directly to success/pending page
        router.push("/apply/success");
      } else {
        // Redirect to sign-in page with callback to payment
        const encodedEmail = encodeURIComponent(variables.email);
        router.push(`/auth/signin?callbackUrl=/apply/payment&email=${encodedEmail}`);
      }
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
            <p className="mt-1 text-sm">
              {membershipFee > 0
                ? "Redirecting to sign in and complete payment..."
                : "Redirecting to confirmation..."}
            </p>
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
            {/* Role Selection */}
            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How would you like to participate? *</FormLabel>
                  <FormDescription className="mb-3">
                    Select all that apply to you.
                  </FormDescription>
                  <FormControl>
                    <div className="space-y-3">
                      {[
                        {
                          value: "ARTIST" as const,
                          label: "I'm an artist seeking residencies",
                          description: "Browse and apply for artist residencies",
                        },
                        {
                          value: "HOME_OWNER" as const,
                          label: "I have a home to list",
                          description: "List your home for exchanges or artist stays",
                        },
                        {
                          value: "SPONSOR" as const,
                          label: "I want to sponsor artists",
                          description: "Support artists with financial contributions",
                        },
                      ].map((role) => (
                        <label
                          key={role.value}
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                            (field.value as string[])?.includes(role.value)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          } ${isSubmitting ? "cursor-not-allowed opacity-50" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={(field.value as string[])?.includes(role.value) ?? false}
                            onChange={(e) => {
                              const currentValues = (field.value as string[]) ?? [];
                              if (e.target.checked) {
                                field.onChange([...currentValues, role.value]);
                              } else {
                                field.onChange(currentValues.filter((v) => v !== role.value));
                              }
                            }}
                            disabled={isSubmitting}
                            className="mt-1 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <div>
                            <span className="font-medium">{role.label}</span>
                            <p className="text-sm text-muted-foreground">{role.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Membership Fee Display */}
            {selectedRoles?.length > 0 && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Membership Fee:</span>
                  <span className="text-xl font-bold">
                    {membershipFee === 0 ? "Free" : `$${membershipFee}/year`}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isHomeOwner
                    ? "Full membership with home exchange benefits"
                    : isArtist
                    ? "Artist membership with residency access"
                    : "Sponsor membership - support our artist community"}
                </p>
                {membershipFee > 0 && !hasValidPromoCode && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Annual membership fee. Cancel anytime.
                  </p>
                )}
                {membershipFee > 0 && hasValidPromoCode && (
                  <div className="mt-2 rounded-md bg-green-500/10 p-2">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      6-month free trial applied!
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500">
                      Your card will be saved but not charged until after 6 months. Then renews at ${membershipFee}/year.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Profile Photo */}
            <FormField
              control={form.control}
              name="profilePhotoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Photo (optional)</FormLabel>
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

            {/* Portfolio URL - Only for Artists */}
            {isArtist && (
              <FormField
                control={form.control}
                name="portfolioUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio or Work Samples *</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://yourportfolio.com or Instagram/Behance link"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Link to your portfolio, website, Instagram, or Behance profile.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Home Photos - Only for Home Owners */}
            {isHomeOwner && (
              <FormField
                control={form.control}
                name="homePhotos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Home (optional)</FormLabel>
                    <FormControl>
                      <HomePhotosUpload
                        value={field.value ?? []}
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
            )}

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

            {/* Promo Code - Only show for paid memberships */}
            {membershipFee > 0 && (
              <FormField
                control={form.control}
                name="promoCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promo Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter promo code (optional)"
                        disabled={isSubmitting}
                        {...field}
                        className="uppercase"
                      />
                    </FormControl>
                    <FormDescription>
                      Have a promo code? Enter it here for a complimentary trial period.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting || !selectedRoles?.length}
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
              {membershipFee > 0 && !hasValidPromoCode && (
                <> After submission, you&apos;ll set up your ${membershipFee}/year membership subscription.</>
              )}
              {membershipFee > 0 && hasValidPromoCode && (
                <> After submission, you&apos;ll enter your card details for your 6-month free trial.</>
              )}
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
