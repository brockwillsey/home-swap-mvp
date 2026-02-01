import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Get Jane (the guest)
  const jane = await prisma.user.findUnique({
    where: { email: "testapplicant@example.com" }
  });

  // Get Alex's home
  const home = await prisma.home.findUnique({
    where: { id: "alex-sf-loft" },
    include: { owner: true }
  });

  if (!jane || !home) {
    console.log("❌ User or home not found");
    return;
  }

  // Create a booking request for next week
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 7);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 5);

  const reservation = await prisma.reservation.create({
    data: {
      guestId: jane.id,
      homeId: home.id,
      startDate,
      endDate,
      status: "PENDING",
      bookingType: "POINTS",
      pointsCost: 50,
    },
  });

  console.log("✅ Booking request created!");
  console.log("");
  console.log("📋 Reservation Details:");
  console.log("   ID:", reservation.id);
  console.log("   Guest: Jane Artist");
  console.log("   Host: Alex Chen");
  console.log("   Listing: Sunny SF Loft with Bay Views");
  console.log("   Dates:", startDate.toLocaleDateString(), "-", endDate.toLocaleDateString());
  console.log("   Type: Points (50 points)");
  console.log("   Status: PENDING");
  console.log("");
  console.log("🔔 Alex should now see this request in their bookings.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
