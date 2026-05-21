import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Lock, Sparkles } from "lucide-react";

import UpgradePlanButton from "@/components/billing/upgrade-plan-button";
import FormBuilderScreen from "@/components/form-builder/form-builder-screen";
import { authOptions } from "@/lib/auth";
import { canCreateMoreForms, FREE_PLAN_FORM_LIMIT } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

export default async function CreateFormPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      plan: true,
      _count: {
        select: {
          forms: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (!canCreateMoreForms(user.plan, user._count.forms)) {
    return (
      <div className="mx-auto max-w-4xl">
        <section className="overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
            <Sparkles size={13} />
            Free plan limit reached
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white">
            Upgrade to Pro to create more forms
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
            Your free workspace already uses all {FREE_PLAN_FORM_LIMIT} form slots. Move to Pro to unlock unlimited form creation and keep building without deleting existing work.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Current plan
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">Free</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Forms used
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {user._count.forms}/{FREE_PLAN_FORM_LIMIT}
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-400/10 bg-emerald-400/[0.06] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
                Pro benefit
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">Unlimited forms</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <UpgradePlanButton
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 text-sm font-semibold text-[#171717] transition hover:bg-amber-400"
            />
            <Link
              href="/forms"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
            >
              <Lock size={16} />
              Back to forms
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return <FormBuilderScreen />;
}
