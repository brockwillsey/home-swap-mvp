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
import { ProfilePhotoUpload } from "./ProfilePhotoUpload";
import { profileUpdateSchema, type ProfileUpdateData } from "~/lib/validations/profile";
import { api } from "~/trpc/react";

interface ProfileEditFormProps {
  initialData: {
    name: string;
    image: string;
    bio: string;
    location: string;
    creativeInterests: string;
  };
}

/**
 * Profile Edit Form Component
 *
 * Allows members to edit their profile information.
 * Uses React Hook Form + Zod validation.
 * Submits via tRPC mutation.
 */
export function ProfileEditForm({ initialData }: ProfileEditFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: initialData.name,
      image: initialData.image || undefined,
      bio: initialData.bio,
      location: initialData.location,
      creativeInterests: initialData.creativeInterests,
    },
  });

  const updateProfile = api.profile.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      router.push("/profile");
      router.refresh();
    },
    onError: (error) => {
      setSubmitError(error.message);
    },
  });

  async function onSubmit(data: ProfileUpdateData) {
    setSubmitError(null);
    updateProfile.mutate(data);
  }

  const isSubmitting = updateProfile.isPending;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your profile details. This information is visible to other members.
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
            {/* Profile Photo */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Photo</FormLabel>
                  <FormControl>
                    <ProfilePhotoUpload
                      value={field.value ?? ""}
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

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
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

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
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
                  <FormLabel>About You</FormLabel>
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

            {/* Creative Interests */}
            <FormField
              control={form.control}
              name="creativeInterests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Creative Interests</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What are your creative pursuits? Art, design, music, writing, etc..."
                      className="min-h-[100px] resize-y"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Musa Residency is a community for creatives. Share your artistic interests.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/profile")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
