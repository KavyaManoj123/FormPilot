import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function isEmptyAnswer(value: unknown) {
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  return value === null || value === undefined;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const form = await prisma.form.findUnique({
    where: { id },
    include: {
      fields: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!form || form.status === "CLOSED") {
    return NextResponse.json({ error: "Form is not accepting responses" }, { status: 404 });
  }

  const answers = body?.answers;

  if (!answers || typeof answers !== "object") {
    return NextResponse.json({ error: "Answers are required" }, { status: 400 });
  }

  const missingRequiredField = form.fields.find(
    (field) =>
      field.required &&
      !field.hidden &&
      isEmptyAnswer(answers[field.id])
  );

  if (missingRequiredField) {
    return NextResponse.json(
      { error: `${missingRequiredField.label} is required` },
      { status: 400 }
    );
  }

  const response = await prisma.formResponse.create({
    data: {
      formId: id,
      data: answers,
    },
  });

  return NextResponse.json({ success: true, id: response.id });
}
