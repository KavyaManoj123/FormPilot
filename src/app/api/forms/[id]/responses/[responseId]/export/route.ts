import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as XLSX from 'xlsx';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

function formatAnswerValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(formatAnswerValue).join(', ');
  }

  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function getSafeFilename(value: string) {
  return (
    value
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 120) || 'response'
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; responseId: string }> }
) {
  const userId = await getCurrentUserId();
  const { id, responseId } = await params;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await prisma.form.findFirst({
    where: { id, userId },
    include: {
      fields: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }

  const response = await prisma.formResponse.findFirst({
    where: {
      id: responseId,
      formId: id,
    },
  });

  if (!response) {
    return NextResponse.json({ error: 'Response not found' }, { status: 404 });
  }

  const rows: Array<Array<string>> = [
    ['Form title', form.title],
    ['Response ID', response.id],
    ['Submitted at', response.createdAt.toISOString()],
    [],
    ['Field', 'Answer'],
    ...form.fields.map(field => [
      field.label || field.id,
      formatAnswerValue((response.data as Record<string, unknown>)[field.id]),
    ]),
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Response');

  const buffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'buffer',
  });

  const filename = `${getSafeFilename(form.title)}-response-${response.id}.xlsx`;

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
