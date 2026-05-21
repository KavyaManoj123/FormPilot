'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  ArrowUpRight,
  Copy,
  ExternalLink,
  FileText,
  ListFilter,
  PencilLine,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';

import UpgradePlanButton from '@/components/billing/upgrade-plan-button';
import { FREE_PLAN_FORM_LIMIT, type UserPlan } from '@/lib/plans';
import { cn, formatRelativeDate } from '@/lib/utils';

type StatusFilter = 'ALL' | 'LIVE' | 'DRAFT' | 'CLOSED';
type SortOption = 'NEWEST' | 'OLDEST' | 'RESPONSES';

interface FormListItem {
  id: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'LIVE' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  fieldsCount: number;
  responsesCount: number;
}

interface FormsListViewProps {
  initialForms: FormListItem[];
  initialPlan: UserPlan;
  canCreateMore: boolean;
}

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'All status' },
  { value: 'LIVE', label: 'Live' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'CLOSED', label: 'Closed' },
];

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: 'NEWEST', label: 'Newest first' },
  { value: 'OLDEST', label: 'Oldest first' },
  { value: 'RESPONSES', label: 'Most responses' },
];

function getStatusTone(status: FormListItem['status']) {
  if (status === 'LIVE') {
    return 'bg-lime-500/15 text-lime-300 ring-1 ring-lime-500/20';
  }

  if (status === 'CLOSED') {
    return 'bg-rose-500/12 text-rose-300 ring-1 ring-rose-500/20';
  }

  return 'bg-amber-500/12 text-amber-200 ring-1 ring-amber-500/20';
}

function getStatusText(status: FormListItem['status']) {
  if (status === 'LIVE') {
    return 'Live';
  }

  if (status === 'CLOSED') {
    return 'Closed';
  }

  return 'Draft';
}

export default function FormsListView({
  initialForms,
  initialPlan,
  canCreateMore,
}: FormsListViewProps) {
  const router = useRouter();
  const [forms, setForms] = useState(initialForms);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('LIVE');
  const [sortBy, setSortBy] = useState<SortOption>('NEWEST');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const normalizedQuery = search.trim().toLowerCase();
  const remainingSlots = Math.max(0, FREE_PLAN_FORM_LIMIT - forms.length);
  const liveFormsCount = forms.filter((form) => form.status === 'LIVE').length;
  const currentCanCreateMore =
    initialPlan === 'PRO' || canCreateMore || forms.length < FREE_PLAN_FORM_LIMIT;

  const filteredForms = useMemo(() => {
    return [...forms]
      .filter((form) =>
        statusFilter === 'ALL' ? true : form.status === statusFilter
      )
      .filter((form) => {
        if (!normalizedQuery) {
          return true;
        }

        return `${form.title} ${form.description} ${form.id}`
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((left, right) => {
        if (sortBy === 'OLDEST') {
          return (
            new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
          );
        }

        if (sortBy === 'RESPONSES') {
          return right.responsesCount - left.responsesCount;
        }

        return (
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
        );
      });
  }, [forms, normalizedQuery, sortBy, statusFilter]);

  const handleCopyLink = async (id: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/f/${id}`);
    setCopiedId(id);

    window.setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current));
    }, 1800);
  };

  const handleDelete = async (id: string) => {
    const response = await fetch(`/api/forms/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setForms((current) => current.filter((form) => form.id !== id));
      router.refresh();
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-[28px] border border-white/8 bg-[#181818] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">
              My forms
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              {initialPlan === 'PRO'
                ? `${forms.length} forms - unlimited Pro workspace`
                : `${forms.length} forms - ${remainingSlots} slot${remainingSlots === 1 ? '' : 's'} remaining`}
            </p>
          </div>

          {currentCanCreateMore ? (
            <Link
              href="/forms/create"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              <Plus size={16} />
              New form
            </Link>
          ) : (
            <UpgradePlanButton
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 text-sm font-semibold text-[#171717] transition hover:bg-amber-400"
            />
          )}
        </div>

        <div className="mt-6 grid gap-3 xl:grid-cols-[minmax(0,1fr)_210px_210px]">
          <label className="relative block">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search forms..."
              className="h-12 w-full rounded-2xl border border-white/10 bg-[#232323] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500/70"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="h-12 rounded-2xl border border-white/10 bg-[#232323] px-4 text-sm text-white outline-none transition focus:border-blue-500/70"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            className="h-12 rounded-2xl border border-white/10 bg-[#232323] px-4 text-sm text-white outline-none transition focus:border-blue-500/70"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
          <ListFilter size={14} />
          <span>
            {filteredForms.length} result{filteredForms.length === 1 ? '' : 's'} shown
          </span>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-white/8 bg-[#181818]">
        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            <div className="grid grid-cols-[minmax(0,2.6fr)_90px_110px_140px_220px] gap-4 border-b border-white/8 bg-white/[0.02] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              <span>Form status / name</span>
              <span>Fields</span>
              <span>Responses</span>
              <span>Last updated</span>
              <span>Actions</span>
            </div>

            {filteredForms.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-zinc-500">
                  <FileText size={20} />
                </div>
                <p className="mt-5 text-lg font-semibold text-white">
                  No forms match this filter
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Try a different status, change the search text, or create a new form.
                </p>
              </div>
            ) : (
              filteredForms.map((form) => (
                <div
                  key={form.id}
                  className="grid grid-cols-[minmax(0,2.6fr)_90px_110px_140px_220px] gap-4 border-b border-white/8 px-5 py-5 text-sm last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          'mt-0.5 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                          getStatusTone(form.status)
                        )}
                      >
                        {getStatusText(form.status)}
                      </span>

                      <div className="min-w-0">
                        <Link
                          href={`/forms/${form.id}/edit`}
                          className="block truncate text-base font-semibold text-white transition hover:text-blue-300"
                        >
                          {form.title}
                        </Link>
                        <p className="mt-1 truncate text-xs text-zinc-500">
                          {form.description || `formpilot.app/f/${form.id}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="self-center text-sm font-semibold text-zinc-200">
                    {form.fieldsCount}
                  </div>

                  <div className="self-center text-sm font-semibold text-white">
                    {form.responsesCount}
                  </div>

                  <div className="self-center text-sm text-zinc-400">
                    {formatRelativeDate(form.updatedAt)}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/forms/${form.id}/edit`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#232323] text-zinc-300 transition hover:border-white/20 hover:text-white"
                      title="Edit form"
                    >
                      <PencilLine size={15} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(form.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#232323] text-zinc-300 transition hover:border-white/20 hover:text-white"
                      title={copiedId === form.id ? 'Copied' : 'Copy public link'}
                    >
                      <Copy size={15} />
                    </button>

                    <Link
                      href={`/forms/${form.id}/responses`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#232323] text-zinc-300 transition hover:border-white/20 hover:text-white"
                      title="View responses"
                    >
                      <ArrowUpRight size={15} />
                    </Link>

                    <Link
                      href={`/f/${form.id}`}
                      target="_blank"
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#232323] text-zinc-300 transition hover:border-white/20 hover:text-white"
                      title="Open public form"
                    >
                      <ExternalLink size={15} />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(form.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#232323] text-zinc-300 transition hover:border-rose-400/40 hover:text-rose-300"
                      title="Delete form"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-white/8 bg-white/[0.02] px-5 py-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-zinc-300">
              <span className="font-semibold text-white">{liveFormsCount}</span> live
              form{liveFormsCount === 1 ? '' : 's'} published.
              {initialPlan === 'PRO'
                ? ' Your workspace is on Pro with unlimited form creation.'
                : remainingSlots > 0
                ? ` You have ${remainingSlots} free-plan slot${remainingSlots === 1 ? '' : 's'} left.`
                : ' Upgrade to Pro for more form slots.'}
            </p>

            {currentCanCreateMore ? (
              <Link
                href="/forms/create"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-blue-200"
              >
                Create a new form
                <ArrowUpRight size={14} />
              </Link>
            ) : (
              <UpgradePlanButton
                className="inline-flex items-center gap-2 text-sm font-semibold text-amber-300 transition hover:text-amber-200"
              />
            )}
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm text-zinc-400">
        Select multiple forms using checkboxes for bulk delete or export responses.
      </div>
    </div>
  );
}
