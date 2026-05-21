import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { canCreateMoreForms } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { formSchema } from "@/lib/validations";

async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      plan: true,
      _count: {
        select: {
          forms: true,
        },
      },
    },
  });

  return user;
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const forms = await prisma.form.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      fields: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: {
          fields: true,
          responses: true,
        },
      },
    },
  });

  return NextResponse.json(
    forms.map((form) => ({
      ...form,
      responsesCount: form._count.responses,
      fieldsCount: form._count.fields,
    }))
  );
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canCreateMoreForms(user.plan, user._count.forms)) {
    return NextResponse.json(
      {
        error: "Free plan limit reached. Upgrade to Pro to create more than 3 forms.",
        code: "PLAN_LIMIT_REACHED",
      },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = formSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid form payload",
      },
      { status: 400 }
    );
  }

  const form = await prisma.form.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      redirectUrl: parsed.data.redirectUrl || null,
      userId: user.id,
      fields: {
        create: parsed.data.fields.map((field, index) => ({
          id: field.id,
          type: field.type,
          label: field.label,
          placeholder: field.placeholder,
          helperText: field.helperText,
          required: field.required,
          hidden: field.hidden,
          options: field.options,
          order: index,
        })),
      },
    },
    include: {
      fields: {
        orderBy: { order: "asc" },
      },
    },
  });

  return NextResponse.json(form, { status: 201 });
}
