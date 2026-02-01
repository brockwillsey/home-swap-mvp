import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Get both users
  const jane = await prisma.user.findUnique({
    where: { email: "testapplicant@example.com" }
  });
  const alex = await prisma.user.findUnique({
    where: { email: "photographer@example.com" }
  });

  if (!jane || !alex) {
    console.log("❌ Users not found");
    return;
  }

  // Create a conversation between Jane and Alex
  const messages = await prisma.message.createMany({
    data: [
      {
        senderId: jane.id,
        receiverId: alex.id,
        content: "Hi Alex! I'm so excited about staying at your SF loft next week. Is there anything I should know about the neighborhood?",
        contextType: "BOOKING_COORDINATION",
        isRead: true,
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        senderId: alex.id,
        receiverId: jane.id,
        content: "Hey Jane! Welcome! The neighborhood is great for walks. There's an amazing coffee shop called Blue Bottle just around the corner, and SFMOMA is a 10 min walk. I'll leave you a welcome guide!",
        contextType: "BOOKING_COORDINATION",
        isRead: true,
        createdAt: new Date(Date.now() - 3000000), // 50 min ago
      },
      {
        senderId: jane.id,
        receiverId: alex.id,
        content: "That sounds perfect! I love Blue Bottle. What time can I check in?",
        contextType: "BOOKING_COORDINATION",
        isRead: false,
        createdAt: new Date(Date.now() - 1800000), // 30 min ago
      },
    ],
  });

  console.log("✅ Messages created!");
  console.log("");
  console.log("💬 Conversation between Jane & Alex:");
  console.log("");
  console.log("   Jane (1h ago): Hi Alex! I'm so excited about staying...");
  console.log("   Alex (50m ago): Hey Jane! Welcome! The neighborhood...");
  console.log("   Jane (30m ago): That sounds perfect! I love Blue Bottle...");
  console.log("");
  console.log("📬 Alex has 1 unread message from Jane");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
