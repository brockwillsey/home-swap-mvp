import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find the pending reservation
  const reservation = await prisma.reservation.findFirst({
    where: { status: "PENDING" },
    include: {
      guest: true,
      home: { include: { owner: true } },
    },
  });

  if (!reservation) {
    console.log("❌ No pending reservation found");
    return;
  }

  // Update reservation to CONFIRMED
  await prisma.reservation.update({
    where: { id: reservation.id },
    data: { status: "CONFIRMED" },
  });

  // Deduct points from guest
  await prisma.user.update({
    where: { id: reservation.guestId },
    data: { points: { decrement: reservation.pointsCost ?? 0 } },
  });

  // Award points to host
  await prisma.user.update({
    where: { id: reservation.home.ownerId },
    data: { points: { increment: reservation.pointsCost ?? 0 } },
  });

  // Create point transactions
  await prisma.pointTransaction.createMany({
    data: [
      {
        userId: reservation.guestId,
        amount: -(reservation.pointsCost ?? 0),
        type: "SPENT_BOOKING",
        description: `Booking at ${reservation.home.title}`,
        reservationId: reservation.id,
      },
      {
        userId: reservation.home.ownerId,
        amount: reservation.pointsCost ?? 0,
        type: "EARNED_HOSTING",
        description: `Hosted ${reservation.guest.name ?? "guest"} at ${reservation.home.title}`,
        reservationId: reservation.id,
      },
    ],
  });

  // Get updated balances
  const guest = await prisma.user.findUnique({ where: { id: reservation.guestId } });
  const host = await prisma.user.findUnique({ where: { id: reservation.home.ownerId } });

  console.log("✅ Booking approved!");
  console.log("");
  console.log("📋 Reservation: " + reservation.id);
  console.log("   Status: CONFIRMED");
  console.log("");
  console.log("💰 Points transferred:");
  console.log("   Jane (guest): 100 → " + guest?.points + " points (-50)");
  console.log("   Alex (host):  150 → " + host?.points + " points (+50)");
  console.log("");
  console.log("📧 Confirmation emails would be sent (requires Resend API key)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
