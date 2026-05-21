'use client';

import { CalendarDays, Command, LogOut, Plus } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import UpgradePlanButton from '@/components/billing/upgrade-plan-button';
import { type UserPlan } from '@/lib/plans';

export default function Topbar({
  canCreate,
  plan,
}: {
  canCreate: boolean;
  plan: UserPlan;
}) {
  const { data: session } = useSession();
  const router = useRouter();

  const userName = session?.user?.name?.split(' ')[0] || 'there';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="flex h-20 items-center justify-between border-b border-white/8 bg-[#121212] px-6">
      <div>
        <p className="text-sm font-medium text-zinc-500">FormPilot workspace</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white">
          Welcome back, {userName}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400 xl:flex">
          <CalendarDays size={16} />
          <span>{today}</span>
        </div>

        <div className="hidden items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-zinc-500 lg:flex">
          <Command size={15} />
          <span>Quick create</span>
        </div>

        {canCreate ? (
          <button
            onClick={() => router.push('/forms/create')}
            className="flex h-12 items-center gap-2 rounded-2xl bg-blue-600 px-5 font-medium text-white transition hover:bg-blue-500"
          >
            <Plus size={18} />
            New Form
          </button>
        ) : (
          <UpgradePlanButton
            label={plan === 'PRO' ? 'Manage Pro' : 'Upgrade to Pro'}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 font-medium text-[#171717] transition hover:bg-amber-400"
          />
        )}

        <button
          onClick={() =>
            signOut({
              callbackUrl: '/login',
            })
          }
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-zinc-300 transition hover:border-white/20 hover:text-white"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
