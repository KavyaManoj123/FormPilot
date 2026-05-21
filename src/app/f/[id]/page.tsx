import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

import PublicForm from "@/components/form-builder/public-form";
import { FieldType, FormStatus } from "@/components/form-builder/types";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  const { id } = await params;

  const form = await prisma.form.findFirst({
    where: email
      ? {
          id,
          OR: [{ status: "LIVE" }, { user: { email } }],
        }
      : {
          id,
          status: "LIVE",
        },
    include: {
      fields: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!form) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1c2438_0%,#0c0c0c_35%,#090909_100%)] px-4 py-16 text-white">
      <PublicForm
        form={{
          id: form.id,
          title: form.title,
          description: form.description ?? "",
          status: form.status as FormStatus,
          redirectUrl: form.redirectUrl ?? "",
          createdAt: form.createdAt.toISOString(),
          updatedAt: form.updatedAt.toISOString(),
          fields: form.fields.map((field) => ({
            id: field.id,
            type: field.type as FieldType,
            label: field.label,
            placeholder: field.placeholder ?? "",
            helperText: field.helperText ?? "",
            required: field.required,
            hidden: field.hidden,
            options: Array.isArray(field.options) ? (field.options as string[]) : [],
            order: field.order,
          })),
        }}
      />
    </div>
  );
}
