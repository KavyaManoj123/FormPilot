import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCheck,
  FileText,
  Inbox,
  Sparkles,
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRelativeDate } from "@/lib/utils";

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const RENDER_TIME = Date.now();

function countAnsweredFields(data: unknown) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return 0;
  }

  return Object.values(data as Record<string, unknown>).filter((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === "string") {
      return value.trim().length > 0;
    }

    return value !== null && value !== undefined;
  }).length;
}

export default async function ResponsesPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    redirect("/login");
  }

  const forms = await prisma.form.findMany({
    where: {
      user: {
        email,
      },
    },
    include: {
      fields: {
        select: {
          id: true,
          required: true,
          hidden: true,
        },
      },
      responses: {
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          responses: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const allResponses = forms.flatMap((form) =>
    form.responses.map((response) => ({
      formId: form.id,
      formTitle: form.title,
      responseId: response.id,
      createdAt: response.createdAt,
      answersCount: countAnsweredFields(response.data),
    }))
  );

  const totalResponses = allResponses.length;
  const recentWindow = new Date(RENDER_TIME - WEEK_IN_MS);
  const responsesThisWeek = allResponses.filter(
    (response) => response.createdAt >= recentWindow
  ).length;

  const formsWithResponses = forms.filter((form) => form._count.responses > 0);
  const topForms = [...formsWithResponses].sort(
    (left, right) => right._count.responses - left._count.responses
  );

  const requiredFieldStats = forms.flatMap((form) => {
    const requiredFieldIds = form.fields
      .filter((field) => field.required && !field.hidden)
      .map((field) => field.id);

    if (requiredFieldIds.length === 0 || form.responses.length === 0) {
      return [];
    }

    const completed = form.responses.filter((response) => {
      const answers =
        response.data && typeof response.data === "object" && !Array.isArray(response.data)
          ? (response.data as Record<string, unknown>)
          : {};

      return requiredFieldIds.every((fieldId) => {
        const value = answers[fieldId];

        if (Array.isArray(value)) {
          return value.length > 0;
        }

        if (typeof value === "string") {
          return value.trim().length > 0;
        }

        return value !== null && value !== undefined;
      });
    }).length;

    return [
      {
        total: form.responses.length,
        completed,
      },
    ];
  });

  const totalCompletionRate =
    requiredFieldStats.length === 0
      ? 100
      : Math.round(
          (requiredFieldStats.reduce((sum, item) => sum + item.completed, 0) /
            requiredFieldStats.reduce((sum, item) => sum + item.total, 0)) *
            100
        );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]">
        <div className="border-b border-white/8 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
                <Sparkles size={13} />
                Response workspace
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">
                Responses overview
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                Monitor submissions across all forms, spot the busiest forms, and jump straight into detailed response review.
              </p>
            </div>

            <Link
              href="/forms"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
            >
              <FileText size={16} />
              View forms
            </Link>
          </div>
        </div>

        <div className="grid gap-3 px-5 py-5 sm:grid-cols-2 sm:px-6 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Total responses
            </p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white">
              {totalResponses}
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-400/10 bg-emerald-400/[0.06] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300/70">
              This week
            </p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-emerald-300">
              {responsesThisWeek}
            </p>
          </div>

          <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Forms with activity
            </p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white">
              {formsWithResponses.length}
            </p>
          </div>

          <div className="rounded-3xl border border-amber-400/10 bg-amber-400/[0.06] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/80">
              Completion rate
            </p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white">
              {totalCompletionRate}%
            </p>
          </div>
        </div>
      </section>

      {forms.length === 0 ? (
        <section className="rounded-[30px] border border-white/8 bg-[#181818] px-6 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-white/8 bg-white/[0.03] text-zinc-500">
            <Inbox size={22} />
          </div>
          <p className="mt-5 text-xl font-semibold text-white">No forms available yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            Create your first form to start collecting submissions and viewing response analytics here.
          </p>
          <Link
            href="/forms/create"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <ArrowUpRight size={16} />
            Create form
          </Link>
        </section>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
          <div className="overflow-hidden rounded-[30px] border border-white/8 bg-[#181818]">
            <div className="border-b border-white/8 px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">Forms receiving responses</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Open any form to inspect individual submissions in detail.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300">
                  <BarChart3 size={14} />
                  {forms.length} forms
                </div>
              </div>
            </div>

            <div className="divide-y divide-white/8">
              {forms.map((form) => (
                <div
                  key={form.id}
                  className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-white">{form.title}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {form._count.responses} response{form._count.responses === 1 ? "" : "s"} collected
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300">
                      <CalendarDays size={13} />
                      {form.responses[0]
                        ? formatRelativeDate(form.responses[0].createdAt)
                        : "No submissions yet"}
                    </div>
                    <Link
                      href={`/forms/${form.id}/responses`}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
                    >
                      Review responses
                      <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-[30px] border border-white/8 bg-[#181818]">
              <div className="border-b border-white/8 px-5 py-5">
                <h2 className="text-lg font-semibold text-white">Top forms</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  The most active forms in your workspace right now.
                </p>
              </div>

              <div className="space-y-3 px-5 py-5">
                {topForms.length === 0 ? (
                  <p className="text-sm text-zinc-500">No submissions yet for any form.</p>
                ) : (
                  topForms.slice(0, 4).map((form, index) => (
                    <div
                      key={form.id}
                      className="rounded-3xl border border-white/8 bg-white/[0.02] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                            Rank {index + 1}
                          </p>
                          <p className="mt-2 truncate text-base font-semibold text-white">
                            {form.title}
                          </p>
                        </div>
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                          {form._count.responses}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-[30px] border border-white/8 bg-[#181818]">
              <div className="border-b border-white/8 px-5 py-5">
                <h2 className="text-lg font-semibold text-white">Recent submissions</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Latest activity across all forms.
                </p>
              </div>

              <div className="space-y-3 px-5 py-5">
                {allResponses.length === 0 ? (
                  <p className="text-sm text-zinc-500">Recent responses will appear here.</p>
                ) : (
                  allResponses.slice(0, 6).map((response) => (
                    <div
                      key={response.responseId}
                      className="rounded-3xl border border-white/8 bg-white/[0.02] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {response.formTitle}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">{response.responseId}</p>
                        </div>
                        <span className="text-xs text-zinc-400">
                          {formatRelativeDate(response.createdAt)}
                        </span>
                      </div>

                      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-black/20 px-3 py-1.5 text-xs text-zinc-300">
                        <CheckCheck size={13} />
                        {response.answersCount} answered field
                        {response.answersCount === 1 ? "" : "s"}
                      </div>

                      <Link
                        href={`/forms/${response.formId}/responses`}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-blue-200"
                      >
                        Open form responses
                        <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
