import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import FormsListView from "@/components/dashboard/forms-list-view";
import { authOptions } from "@/lib/auth";
import { canCreateMoreForms } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

export default async function FormsPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      plan: true,
      _count: {
        select: {
          forms: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const forms = await prisma.form.findMany({
    where: {
      user: {
        email,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      _count: {
        select: {
          fields: true,
          responses: true,
        },
      },
    },
  });

  return (
    <FormsListView
      initialPlan={user.plan}
      canCreateMore={canCreateMoreForms(user.plan, user._count.forms)}
      initialForms={forms.map((form) => ({
        id: form.id,
        title: form.title,
        description: form.description ?? "",
        status: form.status as "DRAFT" | "LIVE" | "CLOSED",
        createdAt: form.createdAt.toISOString(),
        updatedAt: form.updatedAt.toISOString(),
        fieldsCount: form._count.fields,
        responsesCount: form._count.responses,
      }))}
    />
  );
}
