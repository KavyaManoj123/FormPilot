import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  CheckCheck,
  CircleArrowOutUpRight,
  FileSpreadsheet,
  Inbox,
  PencilLine,
  Sparkles,
} from 'lucide-react';
import type { Prisma } from '@prisma/client';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatRelativeDate } from '@/lib/utils';

type ResponseRecord = {
  id: string;
  createdAt: Date;
  data: Prisma.JsonValue;
};

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const RENDER_TIME = Date.now();

function asAnswerEntries(data: Prisma.JsonValue) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return [] as Array<[string, Prisma.JsonValue]>;
  }

  return Object.entries(data as Record<string, Prisma.JsonValue>);
}

function getAnswerPreview(data: Prisma.JsonValue) {
  const preview = asAnswerEntries(data)
    .flatMap(([, value]) => {
      if (Array.isArray(value)) {
        return value.map((item) => String(item));
      }

      if (value === null || value === undefined) {
        return [];
      }

      if (typeof value === 'object') {
        return [JSON.stringify(value)];
      }

      return [String(value)];
    })
    .join(' ')
    .trim();

  if (!preview) {
    return 'No answer preview available';
  }

  return preview.length > 96 ? `${preview.slice(0, 96)}...` : preview;
}

function getCompletionRate(
  responses: ResponseRecord[],
  requiredFieldIds: string[]
) {
  if (responses.length === 0) {
    return 0;
  }

  if (requiredFieldIds.length === 0) {
    return 100;
  }

  const completedResponses = responses.filter((response) => {
    const answers = Object.fromEntries(asAnswerEntries(response.data));

    return requiredFieldIds.every((fieldId) => {
      const value = answers[fieldId];

      if (Array.isArray(value)) {
        return value.length > 0;
      }

      if (typeof value === 'string') {
        return value.trim().length > 0;
      }

      return value !== null && value !== undefined;
    });
  }).length;

  return Math.round((completedResponses / responses.length) * 100);
}

function getAnswersCount(data: Prisma.JsonValue) {
  return asAnswerEntries(data).filter(([, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    return value !== null && value !== undefined;
  }).length;
}

function getInitials(value: string) {
  const letters = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return letters || 'RS';
}

function formatAnswerValue(value: Prisma.JsonValue) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.map((item) => String(item)).join(', ') : 'No selection';
  }

  if (value === null || value === undefined) {
    return 'No response';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  const text = String(value).trim();
  return text || 'No response';
}

export default async function FormResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    redirect('/login');
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
          order: 'asc',
        },
      },
      responses: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!form) {
    redirect('/forms');
  }

  const selectedResponse = form.responses[0] ?? null;
  const selectedEntries = selectedResponse ? Object.fromEntries(asAnswerEntries(selectedResponse.data)) : {};
  const requiredFieldIds = form.fields.filter((field) => field.required && !field.hidden).map((field) => field.id);
  const recentWindow = RENDER_TIME - WEEK_IN_MS;
  const responsesThisWeek = form.responses.filter(
    (response) => response.createdAt.getTime() >= recentWindow
  ).length;
  const completionRate = getCompletionRate(form.responses, requiredFieldIds);
  const latestResponse = form.responses[0] ?? null;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]">
        <div className="border-b border-white/8 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <Link
                href="/forms"
                className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
              >
                <ArrowLeft size={16} />
                Back to forms
              </Link>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <h1 className="truncate text-3xl font-semibold tracking-[-0.05em] text-white">
                  {form.title}
                </h1>
                <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Responses
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                Review submissions, inspect answer quality, and track recent collection activity for this form.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/f/${form.id}`}
                target="_blank"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
              >
                <CircleArrowOutUpRight size={16} />
                Open form
              </Link>
              <Link
                href={`/forms/${form.id}/edit`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                <PencilLine size={16} />
                Edit form
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 px-5 py-5 sm:grid-cols-2 sm:px-6 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Total responses
            </p>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-4xl font-semibold tracking-[-0.06em] text-white">
                {form.responses.length}
              </span>
              <span className="pb-1 text-sm text-zinc-400">collected</span>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-400/10 bg-emerald-400/[0.06] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300/70">
              This week
            </p>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-4xl font-semibold tracking-[-0.06em] text-emerald-300">
                {responsesThisWeek}
              </span>
              <span className="pb-1 text-sm text-emerald-100/70">new replies</span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Completion rate
            </p>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-4xl font-semibold tracking-[-0.06em] text-white">
                {completionRate}%
              </span>
              <span className="pb-1 text-sm text-zinc-400">required fields answered</span>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-400/10 bg-amber-400/[0.06] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/80">
              Latest response
            </p>
            <div className="mt-3 space-y-1">
              <p className="text-lg font-semibold text-white">
                {latestResponse ? formatRelativeDate(latestResponse.createdAt) : 'No submissions yet'}
              </p>
              <p className="text-sm text-amber-100/70">
                {latestResponse
                  ? `${getAnswersCount(latestResponse.data)} answered field${getAnswersCount(latestResponse.data) === 1 ? '' : 's'}`
                  : 'Share the form link to start collecting data'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {form.responses.length === 0 ? (
        <section className="rounded-[30px] border border-white/8 bg-[#181818] px-6 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-white/8 bg-white/[0.03] text-zinc-500">
            <Inbox size={22} />
          </div>
          <p className="mt-5 text-xl font-semibold text-white">No responses yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            Once people submit this form, their responses will appear here in a review-friendly layout.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={`/f/${form.id}`}
              target="_blank"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
            >
              <CircleArrowOutUpRight size={16} />
              Open public form
            </Link>
            <Link
              href={`/forms/${form.id}/edit`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              <PencilLine size={16} />
              Improve form
            </Link>
          </div>
        </section>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[minmax(340px,0.9fr)_minmax(0,1.3fr)]">
          <div className="overflow-hidden rounded-[30px] border border-white/8 bg-[#181818]">
            <div className="border-b border-white/8 px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Submission queue</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Latest responses first, ready for review.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300">
                  <FileSpreadsheet size={14} />
                  {form.responses.length} total
                </div>
              </div>
            </div>

            <div className="max-h-[780px] overflow-y-auto">
              {form.responses.map((response, index) => (
                <div
                  key={response.id}
                  className={[
                    'border-b border-white/8 px-5 py-4 last:border-b-0',
                    index === 0
                      ? 'bg-blue-500/[0.08]'
                      : 'bg-transparent transition hover:bg-white/[0.02]',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-sm font-semibold text-blue-200">
                      {getInitials(response.id)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            Response #{form.responses.length - index}
                          </p>
                          <p className="mt-1 truncate text-xs text-zinc-500">
                            {response.id}
                          </p>
                        </div>
                        {index === 0 ? (
                          <span className="inline-flex rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-300">
                            Selected
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={13} />
                          {formatRelativeDate(response.createdAt)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCheck size={13} />
                          {getAnswersCount(response.data)} answered
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-zinc-300">
                        {getAnswerPreview(response.data)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-white/8 bg-[#181818]">
            <div className="border-b border-white/8 px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/15 bg-blue-500/10 text-sm font-semibold text-blue-200">
                      {getInitials(selectedResponse?.id ?? '')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                        Response detail
                      </p>
                      <h2 className="truncate text-xl font-semibold text-white">
                        Response #{form.responses.length}
                      </h2>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                    <span>{selectedResponse ? formatRelativeDate(selectedResponse.createdAt) : 'No date'}</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-600" />
                    <span>{selectedResponse ? getAnswersCount(selectedResponse.data) : 0} fields answered</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  <Sparkles size={13} />
                  Latest submission
                </div>
              </div>
            </div>

            <div className="space-y-4 px-5 py-5 sm:px-6">
              {form.fields.map((field) => {
                const rawValue = selectedEntries[field.id];
                const answer = formatAnswerValue(rawValue ?? null);
                const hasValue = answer !== 'No response' && answer !== 'No selection';

                return (
                  <div
                    key={field.id}
                    className="rounded-3xl border border-white/8 bg-white/[0.02] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                        {field.label}
                      </p>
                      {field.required ? (
                        <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200">
                          Required
                        </span>
                      ) : null}
                    </div>

                    <div
                      className={
                        typeof rawValue === 'object' && rawValue !== null && !Array.isArray(rawValue)
                          ? 'mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-2xl bg-black/20 p-4 text-sm leading-6 text-zinc-200'
                          : 'mt-3 text-sm leading-7 text-zinc-200'
                      }
                    >
                      {answer}
                    </div>

                    {field.helperText ? (
                      <p className="mt-3 text-xs text-zinc-500">{field.helperText}</p>
                    ) : !hasValue ? (
                      <p className="mt-3 text-xs text-zinc-500">
                        This respondent skipped the field.
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
