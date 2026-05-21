import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formSchema } from "@/lib/validations";

async function getCurrentUserId() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return user?.id ?? null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await prisma.form.findFirst({
    where: { id, userId },
    include: {
      fields: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: {
          responses: true,
        },
      },
    },
  });

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...form,
    responsesCount: form._count.responses,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingForm = await prisma.form.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existingForm) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
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

  const form = await prisma.form.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      redirectUrl: parsed.data.redirectUrl || null,
      fields: {
        deleteMany: {},
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

  return NextResponse.json(form);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingForm = await prisma.form.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!existingForm) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  await prisma.form.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
