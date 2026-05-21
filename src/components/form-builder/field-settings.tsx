'use client';

import { Plus, Trash2 } from 'lucide-react';

import { FormBuilderController } from './types';

const optionFieldTypes = new Set([
  'SINGLE_CHOICE',
  'MULTI_SELECT',
  'DROPDOWN',
]);

export default function FieldSettings({
  builder,
}: {
  builder: FormBuilderController;
}) {
  const field = builder.selectedField;

  if (!field) {
    return (
      <aside className="w-[340px] border-l border-white/8 bg-[#171717] p-5">
        <div className="rounded-[28px] border border-white/8 bg-[#1c1c1c] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Field settings
          </p>
          <p className="mt-8 text-sm leading-6 text-zinc-400">
            Select any field in the canvas to edit labels, placeholder text, required state, visibility, and options.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-[340px] overflow-y-auto border-l border-white/8 bg-[#171717] p-5">
      <div className="rounded-[28px] border border-white/8 bg-[#1c1c1c] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Field settings
        </h2>

        <div className="mt-5 space-y-5">
          <div>
            <label className="text-sm font-medium text-zinc-300">Label</label>
            <input
              value={field.label}
              onChange={(event) =>
                builder.updateField(field.id, {
                  label: event.target.value,
                })
              }
              className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500/70"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300">
              Placeholder text
            </label>
            <input
              value={field.placeholder}
              onChange={(event) =>
                builder.updateField(field.id, {
                  placeholder: event.target.value,
                })
              }
              className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500/70"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300">
              Helper text
            </label>
            <input
              value={field.helperText}
              onChange={(event) =>
                builder.updateField(field.id, {
                  helperText: event.target.value,
                })
              }
              className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500/70"
              placeholder="Optional hint for respondents"
            />
          </div>

          {optionFieldTypes.has(field.type) ? (
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-300">Options</label>
                <button
                  type="button"
                  onClick={() => builder.addOption(field.id)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-300 transition hover:text-blue-200"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {field.options.map((option: string, index: number) => (
                  <div key={`${field.id}-${index}`} className="flex items-center gap-2">
                    <input
                      value={option}
                      onChange={(event) =>
                        builder.updateOption(field.id, index, event.target.value)
                      }
                      className="h-11 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-blue-500/70"
                    />
                    <button
                      type="button"
                      onClick={() => builder.removeOption(field.id, index)}
                      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-zinc-400 transition hover:border-rose-400/40 hover:text-rose-300"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-4 border-t border-white/8 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Required</p>
                <p className="text-xs text-zinc-500">Respondents must answer this field</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  builder.updateField(field.id, {
                    required: !field.required,
                  })
                }
                className={`relative h-7 w-12 rounded-full transition ${
                  field.required ? 'bg-blue-600' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    field.required ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Hidden field</p>
                <p className="text-xs text-zinc-500">Keep it saved but hidden from the public form</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  builder.updateField(field.id, {
                    hidden: !field.hidden,
                  })
                }
                className={`relative h-7 w-12 rounded-full transition ${
                  field.hidden ? 'bg-blue-600' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    field.hidden ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="border-t border-white/8 pt-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Form settings
            </h3>
            <label className="mt-4 block text-sm font-medium text-zinc-300">
              Redirect URL after submit
            </label>
            <input
              value={builder.redirectUrl}
              onChange={(event) => builder.setRedirectUrl(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500/70"
              placeholder="https://yoursite.com/thank-you"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
