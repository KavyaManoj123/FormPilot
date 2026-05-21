"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Inbox,
  LayoutDashboard,
  Plus,
  Settings,
} from "lucide-react";
import { useSession } from "next-auth/react";

import UpgradePlanButton from "@/components/billing/upgrade-plan-button";
import FormPilotLogo from "@/components/shared/formpilot-logo";
import { FREE_PLAN_FORM_LIMIT, type UserPlan } from "@/lib/plans";
import { cn } from "@/lib/utils";

const links = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Forms",
    href: "/forms",
    icon: FileText,
  },
  {
    label: "Responses",
    href: "/responses",
    icon: Inbox,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar({
  plan,
  formsCount,
  canCreate,
}: {
  plan: UserPlan;
  formsCount: number;
  canCreate: boolean;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const usageWidth =
    plan === "PRO"
      ? "100%"
      : `${Math.min(100, (formsCount / FREE_PLAN_FORM_LIMIT) * 100)}%`;

  return (
    <aside className="flex w-[272px] flex-col border-r border-white/8 bg-[#111111]">
      <div className="border-b border-white/8 px-6 py-6">
        <FormPilotLogo
          subtitle="Workspace"
          titleClassName="text-2xl font-semibold tracking-[-0.05em] text-white"
          subtitleClassName="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500"
        />
        <p className="mt-3 text-sm text-zinc-400">Build clean forms</p>
      </div>

      <div className="px-4 pt-5">
        {canCreate ? (
          <Link
            href="/forms/create"
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <Plus size={16} />
            New form
          </Link>
        ) : (
          <UpgradePlanButton
            label="Upgrade to Pro"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 text-sm font-semibold text-[#171717] transition hover:bg-amber-400"
          />
        )}
      </div>

      <div className="flex-1 px-4 py-5">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Workspace
        </p>

        <nav className="space-y-1.5">
          {links.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href === "/forms" && pathname.startsWith("/forms/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                  active
                    ? "bg-white/[0.06] text-white"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-4 pb-4">
        <div className="rounded-[28px] border border-amber-500/15 bg-amber-500/8 p-4">
          <p className="text-sm font-semibold text-amber-300">
            {plan === "PRO" ? "Pro plan" : "Free plan"}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {plan === "PRO"
              ? "Unlimited form creation with room to scale your collection workflows."
              : "Create up to 3 forms. Upgrade to Pro when you need to launch more."}
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/30">
            <div
              className="h-full rounded-full bg-amber-400"
              style={{ width: usageWidth }}
            />
          </div>
          <p className="mt-3 text-xs text-zinc-400">
            {plan === "PRO"
              ? `${formsCount} forms in workspace`
              : `${formsCount}/${FREE_PLAN_FORM_LIMIT} forms used`}
          </p>
        </div>
      </div>

      <div className="border-t border-white/8 p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-sm font-semibold text-white">
            {session?.user?.name?.charAt(0) ?? "U"}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {session?.user?.name ?? "FormPilot user"}
            </p>
            <p className="truncate text-xs text-zinc-500">
              {session?.user?.email ?? "Signed in"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
