import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import FormBuilderScreen from "@/components/form-builder/form-builder-screen";
import { FieldType, FormStatus } from "@/components/form-builder/types";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    redirect("/login");
  }

  const { id } = await params;

  const form = await prisma.form.findFirst({
    where: {
      id,
      user: {
        email,
      },
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
    redirect("/forms");
  }

  return (
    <FormBuilderScreen
      initialForm={{
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
  );
}
