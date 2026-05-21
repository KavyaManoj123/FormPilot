import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
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

export default async function DashboardPage() {
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

  const recentResponses = await prisma.formResponse.findMany({
    where: {
      form: {
        user: {
          email,
        },
      },
    },
    include: {
      form: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
  });

  const totalForms = forms.length;
  const totalResponses = forms.reduce((sum, form) => sum + form._count.responses, 0);
  const liveForms = forms.filter((form) => form.status === "LIVE").length;
  const draftForms = forms.filter((form) => form.status === "DRAFT").length;
  const recentWindow = RENDER_TIME - WEEK_IN_MS;
  const responsesThisWeek = recentResponses.filter(
    (response) => response.createdAt.getTime() >= recentWindow
  ).length;

  const completionSamples = forms.flatMap((form) => {
    const requiredFieldIds = form.fields
      .filter((field) => field.required && !field.hidden)
      .map((field) => field.id);

    if (requiredFieldIds.length === 0 || form._count.responses === 0) {
      return [];
    }

    return [form.id];
  });

  let completedResponses = 0;
  let completionBase = 0;

  if (completionSamples.length > 0) {
    const responsePool = await prisma.formResponse.findMany({
      where: {
        formId: {
          in: completionSamples,
        },
      },
      include: {
        form: {
          select: {
            id: true,
            fields: {
              select: {
                id: true,
                required: true,
                hidden: true,
              },
            },
          },
        },
      },
    });

    for (const response of responsePool) {
      const requiredFieldIds = response.form.fields
        .filter((field) => field.required && !field.hidden)
        .map((field) => field.id);

      if (requiredFieldIds.length === 0) {
        continue;
      }

      completionBase += 1;

      const answers =
        response.data && typeof response.data === "object" && !Array.isArray(response.data)
          ? (response.data as Record<string, unknown>)
          : {};

      const isComplete = requiredFieldIds.every((fieldId) => {
        const value = answers[fieldId];

        if (Array.isArray(value)) {
          return value.length > 0;
        }

        if (typeof value === "string") {
          return value.trim().length > 0;
        }

        return value !== null && value !== undefined;
      });

      if (isComplete) {
        completedResponses += 1;
      }
    }
  }

  const completionRate =
    completionBase === 0 ? 100 : Math.round((completedResponses / completionBase) * 100);

  const mostActiveForms = [...forms]
    .sort((left, right) => right._count.responses - left._count.responses)
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]">
        <div className="flex flex-col gap-4 px-5 py-6 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
              <Sparkles size={13} />
              Live workspace snapshot
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">
              Dashboard overview
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Track form activity, recent submissions, and overall collection health from real workspace data.
            </p>
          </div>

          <Link
            href="/responses"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
          >
            <BarChart3 size={16} />
            Review responses
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border border-white/8 bg-[#181818] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Total forms
          </p>
          <h3 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white">
            {totalForms}
          </h3>
          <p className="mt-2 text-sm text-zinc-400">
            {liveForms} live, {draftForms} draft
          </p>
        </div>

        <div className="rounded-[28px] border border-emerald-400/10 bg-emerald-400/[0.06] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
            Responses
          </p>
          <h3 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-emerald-300">
            {totalResponses}
          </h3>
          <p className="mt-2 text-sm text-emerald-100/70">
            {responsesThisWeek} collected this week
          </p>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-[#181818] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Completion rate
          </p>
          <h3 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white">
            {completionRate}%
          </h3>
          <p className="mt-2 text-sm text-zinc-400">
            Based on required field completion
          </p>
        </div>

        <div className="rounded-[28px] border border-amber-400/10 bg-amber-400/[0.06] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200/80">
            Active forms
          </p>
          <h3 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white">
            {liveForms}
          </h3>
          <p className="mt-2 text-sm text-zinc-400">
            Ready to collect submissions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="overflow-hidden rounded-[30px] border border-white/8 bg-[#181818]">
          <div className="border-b border-white/8 px-6 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Your forms</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Ranked by response activity.
                </p>
              </div>
              <Link
                href="/forms"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-blue-200"
              >
                Open forms
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          <div className="space-y-3 px-5 py-5">
            {mostActiveForms.length === 0 ? (
              <div className="rounded-3xl border border-white/8 bg-white/[0.02] px-5 py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-zinc-500">
                  <FileText size={20} />
                </div>
                <p className="mt-5 text-lg font-semibold text-white">No forms yet</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Create your first form to start seeing performance here.
                </p>
              </div>
            ) : (
              mostActiveForms.map((form, index) => (
                <div
                  key={form.id}
                  className="flex items-center justify-between gap-4 rounded-3xl border border-white/8 bg-white/[0.02] p-4"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                      Rank {index + 1}
                    </p>
                    <p className="mt-2 truncate text-base font-semibold text-white">
                      {form.title}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {form.status} · updated {formatRelativeDate(form.updatedAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-semibold text-white">{form._count.responses}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                      responses
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-[30px] border border-white/8 bg-[#181818]">
          <div className="border-b border-white/8 px-6 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Recent responses</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Latest submissions across your workspace.
                </p>
              </div>
              <Link
                href="/responses"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-blue-200"
              >
                View all
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          <div className="space-y-3 px-5 py-5">
            {recentResponses.length === 0 ? (
              <div className="rounded-3xl border border-white/8 bg-white/[0.02] px-5 py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-zinc-500">
                  <Inbox size={20} />
                </div>
                <p className="mt-5 text-lg font-semibold text-white">No responses yet</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Once people start submitting, the newest responses will show here.
                </p>
              </div>
            ) : (
              recentResponses.map((response) => (
                <div
                  key={response.id}
                  className="rounded-3xl border border-white/8 bg-white/[0.02] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-white">
                        {response.form.title}
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {formatRelativeDate(response.createdAt)}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-black/20 px-3 py-1.5 text-xs text-zinc-300">
                      <CheckCheck size={13} />
                      {countAnsweredFields(response.data)} answered
                    </div>
                  </div>

                  <Link
                    href={`/forms/${response.form.id}/responses`}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-blue-200"
                  >
                    Open response detail
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
