import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

interface MembershipStatusProps {
  /** Date when membership was approved/started */
  membershipStartDate: Date | null;
  /** Whether to show the renewal reminder prominently */
  showRenewalReminder?: boolean;
  /** Compact mode for sidebar display */
  compact?: boolean;
}

/**
 * Calculate membership status based on start date
 */
function getMembershipStatus(startDate: Date | null): {
  status: "active" | "expiring" | "expired" | "pending";
  expiryDate: Date | null;
  daysRemaining: number | null;
} {
  if (!startDate) {
    return { status: "pending", expiryDate: null, daysRemaining: null };
  }

  const now = new Date();
  const expiryDate = new Date(startDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  const msRemaining = expiryDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return { status: "expired", expiryDate, daysRemaining: 0 };
  } else if (daysRemaining <= 30) {
    return { status: "expiring", expiryDate, daysRemaining };
  } else {
    return { status: "active", expiryDate, daysRemaining };
  }
}

/**
 * Get status badge styling
 */
function getStatusBadgeClass(status: "active" | "expiring" | "expired" | "pending"): string {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "expiring":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "expired":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "pending":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
}

/**
 * Get status display text
 */
function getStatusText(status: "active" | "expiring" | "expired" | "pending"): string {
  switch (status) {
    case "active":
      return "Active";
    case "expiring":
      return "Expiring Soon";
    case "expired":
      return "Expired";
    case "pending":
      return "Pending";
  }
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * MembershipStatus Component
 *
 * Displays membership status, start date, and renewal date.
 * Shows appropriate styling based on status (active/expiring/expired).
 */
export function MembershipStatus({
  membershipStartDate,
  showRenewalReminder = false,
  compact = false,
}: MembershipStatusProps) {
  const { status, expiryDate, daysRemaining } = getMembershipStatus(membershipStartDate);

  if (compact) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Membership</span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(status)}`}
          >
            {getStatusText(status)}
          </span>
        </div>
        {expiryDate && (
          <p className="mt-2 text-xs text-muted-foreground">
            {status === "expired" ? "Expired" : "Renews"} {formatDate(expiryDate)}
          </p>
        )}
        {status === "expiring" && daysRemaining !== null && (
          <p className="mt-1 text-xs font-medium text-yellow-600 dark:text-yellow-400">
            {daysRemaining} days remaining
          </p>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Membership Status</CardTitle>
            <CardDescription>Your Art Res membership details</CardDescription>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusBadgeClass(status)}`}
          >
            {getStatusText(status)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {status === "pending" ? (
          <p className="text-muted-foreground">
            Your membership is pending approval.
          </p>
        ) : (
          <div className="space-y-3">
            {/* Start Date */}
            {membershipStartDate && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Member since</span>
                <span className="text-sm font-medium">{formatDate(membershipStartDate)}</span>
              </div>
            )}

            {/* Renewal/Expiry Date */}
            {expiryDate && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  {status === "expired" ? "Expired on" : "Renewal date"}
                </span>
                <span className="text-sm font-medium">{formatDate(expiryDate)}</span>
              </div>
            )}

            {/* Days Remaining for expiring - hide if banner is shown */}
            {status === "expiring" && daysRemaining !== null && !showRenewalReminder && (
              <div className="mt-4 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Your membership expires in {daysRemaining} days
                </p>
                <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                  Renew soon to keep your access to the Art Res community.
                </p>
              </div>
            )}

            {/* Expired Notice - hide if banner is shown */}
            {status === "expired" && !showRenewalReminder && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Your membership has expired
                </p>
                <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                  Renew your membership to continue accessing the Art Res community.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Renewal Reminder (for dashboard) */}
        {showRenewalReminder && (status === "expiring" || status === "expired") && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Renewal functionality coming soon.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact renewal reminder banner for dashboard
 */
export function RenewalReminderBanner({
  membershipStartDate,
}: {
  membershipStartDate: Date | null;
}) {
  const { status, daysRemaining } = getMembershipStatus(membershipStartDate);

  if (status !== "expiring" && status !== "expired") {
    return null;
  }

  const bgClass = status === "expired"
    ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
    : "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800";

  const textClass = status === "expired"
    ? "text-red-800 dark:text-red-200"
    : "text-yellow-800 dark:text-yellow-200";

  return (
    <div className={`rounded-lg border p-4 ${bgClass}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {status === "expired" ? (
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div>
          <h3 className={`text-sm font-medium ${textClass}`}>
            {status === "expired"
              ? "Membership Expired"
              : `Membership Expiring in ${daysRemaining} Days`}
          </h3>
          <p className={`mt-1 text-sm ${textClass} opacity-80`}>
            {status === "expired"
              ? "Your membership has expired. Renew to continue accessing the community."
              : "Your membership is expiring soon. Renew to maintain uninterrupted access."}
          </p>
        </div>
      </div>
    </div>
  );
}
