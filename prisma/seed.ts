import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

/** Demo login: demo@dashboard.ai / demo2108 */
const DEMO_PASSWORD = "demo2108";

async function main() {
  const passwordHash = await hash(DEMO_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@dashboard.ai" },
    update: { passwordHash },
    create: {
      name: "Demo User",
      email: "demo@dashboard.ai",
      passwordHash,
    },
  });

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  await prisma.task.deleteMany({ where: { userId: user.id } });
  await prisma.calendarEvent.deleteMany({ where: { userId: user.id } });

  await prisma.task.createMany({
    data: [
      {
        title: "Review Q1 strategy document",
        description: "Go through the quarterly strategy doc and prepare feedback",
        priority: "high",
        status: "pending",
        estimatedMin: 45,
        dueDate: new Date(today.getTime() + 10 * 60 * 60 * 1000),
        userId: user.id,
      },
      {
        title: "30-minute morning run",
        description: "Cardio session to start the day",
        priority: "medium",
        status: "pending",
        estimatedMin: 30,
        dueDate: new Date(today.getTime() + 7 * 60 * 60 * 1000),
        userId: user.id,
      },
      {
        title: "Prepare presentation slides",
        description: "Create slides for Friday's team meeting",
        priority: "high",
        status: "in_progress",
        estimatedMin: 90,
        dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        userId: user.id,
      },
      {
        title: "Reply to client emails",
        description: "Address pending client queries from yesterday",
        priority: "urgent",
        status: "pending",
        estimatedMin: 20,
        dueDate: new Date(today.getTime() + 9 * 60 * 60 * 1000),
        userId: user.id,
      },
      {
        title: "Read 30 pages of current book",
        description: "Continue reading 'Thinking, Fast and Slow'",
        priority: "low",
        status: "pending",
        estimatedMin: 25,
        dueDate: new Date(today.getTime() + 21 * 60 * 60 * 1000),
        userId: user.id,
      },
    ],
  });

  await prisma.calendarEvent.createMany({
    data: [
      {
        title: "Team Standup",
        startTime: new Date(today.getTime() + 9 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 9.25 * 60 * 60 * 1000),
        userId: user.id,
      },
      {
        title: "1:1 with Manager",
        startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 14.5 * 60 * 60 * 1000),
        userId: user.id,
      },
      {
        title: "Project Review",
        startTime: new Date(today.getTime() + 16 * 60 * 60 * 1000),
        endTime: new Date(today.getTime() + 17 * 60 * 60 * 1000),
        location: "Conference Room B",
        userId: user.id,
      },
    ],
  });

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
