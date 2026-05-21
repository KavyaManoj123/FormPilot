import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Download,
  Globe,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import UpgradePlanButton from "@/components/billing/upgrade-plan-button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "FP";
}

function formatJoinedDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function ToggleRow({
  title,
  description,
  enabled,
}: {
  title: string;
  description: string;
  enabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/8 bg-white/[0.02] px-4 py-4">
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm text-zinc-400">{description}</p>
      </div>

      <label className="relative inline-flex cursor-pointer items-center">
        <input type="checkbox" defaultChecked={enabled} className="peer sr-only" />
        <span className="h-8 w-14 rounded-full bg-white/10 transition peer-checked:bg-blue-500/80" />
        <span className="absolute left-1 h-6 w-6 rounded-full bg-white shadow-sm transition peer-checked:left-7" />
      </label>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
  tone = "default",
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <section
      className={
        tone === "danger"
          ? "overflow-hidden rounded-[30px] border border-rose-500/30 bg-[#1a1315]"
          : "overflow-hidden rounded-[30px] border border-white/8 bg-[#181818]"
      }
    >
      <div
        className={
          tone === "danger"
            ? "border-b border-rose-500/20 px-5 py-5 sm:px-6"
            : "border-b border-white/8 px-5 py-5 sm:px-6"
        }
      >
        <h2
          className={
            tone === "danger"
              ? "text-xl font-semibold text-rose-300"
              : "text-xl font-semibold text-white"
          }
        >
          {title}
        </h2>
        <p className="mt-1 text-sm text-zinc-400">{description}</p>
      </div>

      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      forms: {
        include: {
          _count: {
            select: {
              responses: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const formsCount = user.forms.length;
  const liveFormsCount = user.forms.filter((form) => form.status === "LIVE").length;
  const totalResponses = user.forms.reduce(
    (sum, form) => sum + form._count.responses,
    0
  );
  const profileName = user.name?.trim() || "FormPilot user";
  const initials = getInitials(profileName);
  const planLabel = user.plan === "PRO" ? "Pro plan" : "Free plan";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]">
        <div className="flex flex-col gap-4 px-5 py-6 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
              <Sparkles size={13} />
              Account workspace
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">
              Profile settings
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Manage your personal details, plan visibility, security posture, and workspace preferences from one place.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/8 bg-black/20 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Forms
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">
                {formsCount}
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-400/10 bg-emerald-400/[0.06] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
                Live forms
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-emerald-300">
                {liveFormsCount}
              </p>
            </div>
            <div className="rounded-3xl border border-amber-400/10 bg-amber-400/[0.06] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200/80">
                Responses
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">
                {totalResponses}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[30px] border border-white/8 bg-[#181818] p-4">
          <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
            Settings
          </p>

          <div className="mt-4 space-y-2">
            {[
              { icon: UserRound, label: "Profile", active: true, badge: null },
              { icon: CreditCard, label: "Billing", active: false, badge: user.plan === "PRO" ? "Active" : "Free" },
              { icon: Bell, label: "Notifications", active: false, badge: null },
              { icon: ShieldCheck, label: "Security", active: false, badge: null },
              { icon: KeyRound, label: "API access", active: false, badge: "Pro" },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className={
                    item.active
                      ? "flex items-center justify-between rounded-2xl bg-white/[0.06] px-4 py-3 text-white"
                      : "flex items-center justify-between rounded-2xl px-4 py-3 text-zinc-400 transition hover:bg-white/[0.03] hover:text-white"
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span
                      className={
                        item.badge === "Pro"
                          ? "rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200"
                          : "rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-300"
                      }
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-3xl border border-white/8 bg-white/[0.02] p-4">
            <p className="text-sm font-semibold text-white">Current workspace</p>
            <p className="mt-1 text-sm text-zinc-400">
              {planLabel} with {formsCount} form{formsCount === 1 ? "" : "s"} in the workspace.
            </p>
            <Link
              href="/forms"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-blue-200"
            >
              Open my forms
              <ChevronRight size={15} />
            </Link>
          </div>
        </aside>

        <div className="space-y-6">
          <SectionCard
            title="Personal info"
            description="Control how your identity appears across your FormPilot workspace."
          >
            <div className="flex flex-col gap-5 rounded-[28px] border border-white/8 bg-white/[0.02] p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-blue-600/25 text-3xl font-semibold text-blue-200">
                  {initials}
                </div>

                <div>
                  <p className="text-2xl font-semibold text-white">{profileName}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {user.email} · Member since {formatJoinedDate(user.createdAt)}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    <CheckCircle2 size={13} />
                    Email verified workspace identity
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.06]">
                  Upload photo
                </button>
                <button className="inline-flex h-11 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/8 px-4 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/12">
                  Remove
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Display name
                </p>
                <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white">
                  {profileName}
                </div>
              </div>

              <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Email address
                </p>
                <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white">
                  {user.email}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Plan & billing"
            description="Review plan limits and upgrade signals without leaving your workspace."
          >
            <div className="flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[linear-gradient(135deg,rgba(250,204,21,0.08),rgba(255,255,255,0.02))] p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-200">
                  <CreditCard size={22} />
                </div>

                <div>
                  <p className="text-2xl font-semibold text-white">{planLabel}</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-300">
                    {user.plan === "PRO"
                      ? "Advanced sharing, automation, and API controls are unlocked for this workspace."
                      : "Includes up to 3 forms, full builder access, and response collection for your current workflow."}
                  </p>
                </div>
              </div>

              {user.plan === "PRO" ? (
                <button className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500">
                  Manage subscription
                </button>
              ) : (
                <UpgradePlanButton
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500"
                />
              )}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Form limit
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {user.plan === "PRO" ? "Unlimited" : "3 forms"}
                </p>
              </div>

              <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Response usage
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">{totalResponses}</p>
              </div>

              <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Workspace region
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">Global</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Notifications"
            description="Choose how frequently FormPilot keeps you updated about forms and submissions."
          >
            <div className="space-y-4">
              <ToggleRow
                title="New response email"
                description="Receive an email summary each time someone submits one of your live forms."
                enabled
              />
              <ToggleRow
                title="Weekly performance digest"
                description="Get a concise weekly snapshot of response volume, completion rate, and active forms."
                enabled
              />
              <ToggleRow
                title="Product updates"
                description="Hear about new builder capabilities, analytics improvements, and release notes."
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Security"
            description="Review the trust and access signals attached to your account."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-200">
                    <Lock size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Password protection</p>
                    <p className="text-sm text-zinc-400">Your credentials are secured through encrypted sign-in.</p>
                  </div>
                </div>
                <button className="mt-4 inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.06]">
                  Change password
                </button>
              </div>

              <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-200">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Session trust</p>
                    <p className="text-sm text-zinc-400">Signed in with a verified account session for this workspace.</p>
                  </div>
                </div>
                <button className="mt-4 inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.06]">
                  Review sessions
                </button>
              </div>

              <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-200">
                    <KeyRound size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">API access</p>
                    <p className="text-sm text-zinc-400">Generate controlled access for integrations and external workflows.</p>
                  </div>
                </div>
                <Link
                  href="/api-keys"
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
                >
                  Open API keys
                </Link>
              </div>

              <div className="rounded-3xl border border-white/8 bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-200">
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Public form controls</p>
                    <p className="text-sm text-zinc-400">Keep live forms visible while monitoring submission health and abuse risk.</p>
                  </div>
                </div>
                <Link
                  href="/responses"
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
                >
                  Review response activity
                </Link>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Danger zone"
            description="Use these actions carefully. They affect workspace data and long-term recovery options."
            tone="danger"
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-4 rounded-[28px] border border-rose-500/20 bg-black/10 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-base font-semibold text-white">Export all data</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Download a structured archive of forms and responses for backup or migration.
                  </p>
                </div>
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.06]">
                  <Download size={15} />
                  Export data
                </button>
              </div>

              <div className="flex flex-col gap-4 rounded-[28px] border border-rose-500/20 bg-black/10 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-base font-semibold text-white">Close workspace</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Permanently disable form collection and remove access after a final confirmation step.
                  </p>
                </div>
                <button className="inline-flex h-11 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/16">
                  Request closure
                </button>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
