'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  ArrowLeft,
  Eye,
  Globe,
  LoaderCircle,
  Save,
  Send,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { FormBuilderController } from './types';

interface FormHeaderProps {
  builder: FormBuilderController;
}

export default function FormHeader({ builder }: FormHeaderProps) {
  const router = useRouter();

  const handlePreview = async () => {
    const id = builder.formId ?? (await builder.saveForm(builder.status));

    if (id) {
      window.open(`/f/${id}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="border-b border-white/8 bg-[#171717]/95 px-5 py-4 backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/forms')}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-zinc-300 transition hover:border-white/20 hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-white">
                {builder.title || 'Untitled form'}
              </h1>

              <span
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                  builder.status === 'LIVE'
                    ? 'bg-emerald-500/12 text-emerald-300'
                    : builder.status === 'CLOSED'
                    ? 'bg-rose-500/12 text-rose-300'
                    : 'bg-zinc-700/60 text-zinc-300'
                )}
              >
                {builder.status}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-3 text-sm text-zinc-500">
              <span>{builder.fields.length} field{builder.fields.length === 1 ? '' : 's'}</span>
              {builder.formId ? (
                <Link
                  href={`/f/${builder.formId}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-zinc-400 transition hover:text-white"
                >
                  <Globe size={14} />
                  <span>Public link</span>
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {builder.saveMessage ? (
            <p className="mr-1 text-sm text-zinc-400">{builder.saveMessage}</p>
          ) : null}

          <button
            type="button"
            onClick={() => builder.saveForm('DRAFT')}
            disabled={builder.isSaving}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-zinc-100 transition hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {builder.isSaving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
            Save draft
          </button>

          <button
            type="button"
            onClick={handlePreview}
            disabled={builder.isSaving || builder.fields.length === 0}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-zinc-100 transition hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Eye size={16} />
            Preview
          </button>

          <button
            type="button"
            onClick={() => builder.saveForm('LIVE')}
            disabled={builder.isSaving || builder.fields.length === 0}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Send size={16} />
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
