'use client';

import {
  CalendarDays,
  CheckSquare,
  ChevronDown,
  CircleDot,
  Copy,
  FileUp,
  GripVertical,
  Mail,
  Phone,
  Star,
  Trash2,
  Type,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import { FormField } from './types';

const fieldIcons = {
  SHORT_TEXT: Type,
  LONG_TEXT: Type,
  EMAIL: Mail,
  PHONE: Phone,
  SINGLE_CHOICE: CircleDot,
  MULTI_SELECT: CheckSquare,
  DROPDOWN: ChevronDown,
  DATE: CalendarDays,
  RATING: Star,
  FILE_UPLOAD: FileUp,
} as const;

function renderFieldPreview(field: FormField) {
  switch (field.type) {
    case 'LONG_TEXT':
      return (
        <textarea
          disabled
          rows={4}
          placeholder={field.placeholder || 'Long answer'}
          className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-zinc-500"
        />
      );
    case 'SINGLE_CHOICE':
    case 'MULTI_SELECT':
      return (
        <div className="mt-3 space-y-2">
          {field.options.map((option) => (
            <div
              key={option}
              className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-3 py-2 text-sm text-zinc-300"
            >
              <span className="h-4 w-4 rounded-full border border-white/25" />
              <span>{option}</span>
            </div>
          ))}
        </div>
      );
    case 'DROPDOWN':
      return (
        <div className="mt-3 flex h-12 items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 text-sm text-zinc-500">
          <span>{field.placeholder || 'Select one option'}</span>
          <ChevronDown size={16} />
        </div>
      );
    case 'DATE':
      return (
        <div className="mt-3 flex h-12 items-center rounded-2xl border border-white/10 bg-black/35 px-4 text-sm text-zinc-500">
          Pick a date
        </div>
      );
    case 'RATING':
      return (
        <div className="mt-3 flex gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/35 text-zinc-500"
            >
              {index + 1}
            </div>
          ))}
        </div>
      );
    case 'FILE_UPLOAD':
      return (
        <div className="mt-3 rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-6 text-center text-sm text-zinc-500">
          Drag and drop a file here
        </div>
      );
    default:
      return (
        <input
          disabled
          placeholder={field.placeholder || 'Type your answer here'}
          className="mt-3 h-12 w-full rounded-2xl border border-white/10 bg-black/35 px-4 text-sm text-zinc-500"
        />
      );
  }
}

interface FieldCardProps {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function FieldCard({
  field,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: FieldCardProps) {
  const Icon = fieldIcons[field.type];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        'w-full rounded-[28px] border bg-[#1f1f1f] p-5 text-left transition duration-200',
        isSelected
          ? 'border-blue-500/80 bg-[#23262c] shadow-[0_0_0_1px_rgba(59,130,246,0.18)]'
          : 'border-white/8 hover:border-white/15 hover:bg-[#232323]'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/12 text-blue-300">
            <Icon size={16} />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
              {field.type.replaceAll('_', ' ')}
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {field.label}
              {field.required ? <span className="ml-1 text-rose-400">*</span> : null}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-zinc-500">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDuplicate();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/25 transition hover:border-white/20 hover:text-white"
          >
            <Copy size={14} />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/25 transition hover:border-rose-400/40 hover:text-rose-300"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {field.helperText ? (
        <p className="mt-3 text-sm text-zinc-400">{field.helperText}</p>
      ) : null}

      {renderFieldPreview(field)}

      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <GripVertical size={12} />
          <span>Field {field.order + 1}</span>
        </div>

        {field.hidden ? (
          <span className="rounded-full border border-amber-400/25 bg-amber-500/10 px-2.5 py-1 text-amber-300">
            Hidden
          </span>
        ) : null}
      </div>
    </div>
  );
}
