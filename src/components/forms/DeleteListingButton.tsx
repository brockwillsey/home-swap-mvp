"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";

interface DeleteListingButtonProps {
  listingId: string;
  listingTitle: string;
}

/**
 * Delete Listing Button with Confirmation Dialog
 */
export function DeleteListingButton({
  listingId,
  listingTitle,
}: DeleteListingButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const deleteListing = api.listing.delete.useMutation({
    onSuccess: () => {
      toast.success("Listing deleted");
      setOpen(false);
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function handleDelete() {
    deleteListing.mutate({ id: listingId });
  }

  const isDeleting = deleteListing.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Listing</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{listingTitle}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Listing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
