interface FundProgressProps {
  currentAmount: number;
  goalAmount: number;
  donationCount: number;
  size?: "sm" | "md" | "lg";
}

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
 * Fund Progress Component
 *
 * Displays fundraising progress with a visual bar and stats.
 */
export function FundProgress({
  currentAmount,
  goalAmount,
  donationCount,
  size = "md",
}: FundProgressProps) {
  const progressPercent = Math.min((currentAmount / goalAmount) * 100, 100);
  const isCompleted = currentAmount >= goalAmount;

  const barHeight = size === "sm" ? "h-1.5" : size === "lg" ? "h-4" : "h-2.5";
  const textSize = size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base";
  const subTextSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  return (
    <div className="space-y-2">
      {/* Progress Stats */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className={`${textSize} font-bold text-primary`}>
            {formatCurrency(currentAmount)}
          </span>
          <span className={`${subTextSize} ml-1 text-muted-foreground`}>
            raised
          </span>
        </div>
        <div className={`${subTextSize} text-muted-foreground`}>
          {formatCurrency(goalAmount)} goal
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`${barHeight} overflow-hidden rounded-full bg-muted`}>
        <div
          className={`h-full transition-all duration-500 ease-out ${
            isCompleted ? "bg-green-500" : "bg-primary"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between">
        <span className={`${subTextSize} font-medium ${isCompleted ? "text-green-600" : "text-primary"}`}>
          {progressPercent.toFixed(0)}% funded
          {isCompleted && " - Goal reached!"}
        </span>
        <span className={`${subTextSize} text-muted-foreground`}>
          {donationCount} {donationCount === 1 ? "supporter" : "supporters"}
        </span>
      </div>
    </div>
  );
}
