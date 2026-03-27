import { auth } from "@/auth";
import { prisma } from "./prisma";

/** Current user from session, or null if not signed in. */
export async function getAuthenticatedUser() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}
