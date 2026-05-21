'use client';

import {
  CalendarDays,
  CheckSquare,
  ChevronDown,
  CircleDot,
  FileUp,
  LucideIcon,
  Mail,
  Phone,
  Star,
  Type,
} from 'lucide-react';

import { FieldType, FormBuilderController } from './types';

const fieldGroups: Array<{
  title: string;
  items: Array<{
    label: string;
    type: FieldType;
    icon: LucideIcon;
    pro?: boolean;
  }>;
}> = [
  {
    title: 'Text',
    items: [
      { label: 'Short text', type: 'SHORT_TEXT', icon: Type },
      { label: 'Long text', type: 'LONG_TEXT', icon: Type },
      { label: 'Email', type: 'EMAIL', icon: Mail },
      { label: 'Phone', type: 'PHONE', icon: Phone },
    ],
  },
  {
    title: 'Choice',
    items: [
      { label: 'Single choice', type: 'SINGLE_CHOICE', icon: CircleDot },
      { label: 'Multi-select', type: 'MULTI_SELECT', icon: CheckSquare },
      { label: 'Dropdown', type: 'DROPDOWN', icon: ChevronDown },
    ],
  },
  {
    title: 'Other',
    items: [
      { label: 'Rating', type: 'RATING', icon: Star },
      { label: 'Date', type: 'DATE', icon: CalendarDays },
      { label: 'File upload', type: 'FILE_UPLOAD', icon: FileUp, pro: true },
    ],
  },
];

export default function BuilderSidebar({
  builder,
}: {
  builder: FormBuilderController;
}) {
  return (
    <aside className="w-[280px] border-r border-white/8 bg-[#171717] p-4">
      <div className="rounded-[28px] border border-white/8 bg-[#1c1c1c] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
          Add field
        </p>

        <div className="mt-5 space-y-5">
          {fieldGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                {group.title}
              </p>

              <div className="space-y-2">
                {group.items.map((field) => {
                  const Icon = field.icon;

                  return (
                    <button
                      key={field.type}
                      type="button"
                      onClick={() => builder.addField(field.type)}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm text-zinc-100 transition hover:border-white/20 hover:bg-white/[0.06]"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                          <Icon size={15} />
                        </span>
                        {field.label}
                      </span>

                      {field.pro ? (
                        <span className="rounded-full bg-amber-500/12 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">
                          Pro
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-white/8 bg-black/20 p-4">
          <p className="text-sm font-semibold text-white">Builder tips</p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Click a field to edit its settings, duplicate sections quickly, and publish when the form feels ready.
          </p>
        </div>
      </div>
    </aside>
  );
}
