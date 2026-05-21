import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.update({
    where: { email },
    data: { plan: "PRO" },
    select: {
      id: true,
      plan: true,
    },
  });

  return NextResponse.json({
    success: true,
    plan: user.plan,
  });
}
