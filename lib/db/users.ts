import { db } from "@/lib/db";

export async function isUserRegistered(username: string): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { username },
      select: { id: true },
    });

    return !!user;
  } catch {
    return false;
  }
}
