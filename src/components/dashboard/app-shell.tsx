import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { canCreateMoreForms } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

import Sidebar from "./sidebar";
import Topbar from "./topbar";

export default async function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  const user = email
    ? await prisma.user.findUnique({
        where: { email },
        select: {
          plan: true,
          _count: {
            select: {
              forms: true,
            },
          },
        },
      })
    : null;

  const plan = user?.plan ?? "FREE";
  const formsCount = user?._count.forms ?? 0;
  const canCreate = canCreateMoreForms(plan, formsCount);

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      <Sidebar plan={plan} formsCount={formsCount} canCreate={canCreate} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar canCreate={canCreate} plan={plan} />

        <main className="flex-1 overflow-y-auto p-6 bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}
