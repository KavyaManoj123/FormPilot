'use client';

import FieldCard from './field-card';
import { FormBuilderController, FormField } from './types';

export default function BuilderCanvas({
  builder,
}: {
  builder: FormBuilderController;
}) {
  return (
    <section className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,#23283a_0%,#111111_35%,#0f0f0f_100%)] px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[32px] border border-white/8 bg-[#171717]/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <input
            value={builder.title}
            onChange={(event) => builder.setTitle(event.target.value)}
            className="w-full bg-transparent text-4xl font-semibold tracking-[-0.04em] text-white outline-none placeholder:text-zinc-600"
            placeholder="Untitled form"
          />

          <textarea
            placeholder="Form description"
            value={builder.description}
            onChange={(event) => builder.setDescription(event.target.value)}
            className="mt-4 min-h-20 w-full resize-none bg-transparent text-base leading-7 text-zinc-400 outline-none placeholder:text-zinc-600"
          />
        </div>

        <div className="mt-6 space-y-4">
          {builder.fields.map((field: FormField) => (
            <FieldCard
              key={field.id}
              field={field}
              isSelected={builder.selectedFieldId === field.id}
              onSelect={() => builder.setSelectedFieldId(field.id)}
              onDelete={() => builder.deleteField(field.id)}
              onDuplicate={() => builder.duplicateField(field.id)}
            />
          ))}

          {builder.fields.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-white/10 bg-[#171717]/70 px-8 py-14 text-center">
              <p className="text-lg font-semibold text-white">Start by adding your first field</p>
              <p className="mt-2 text-sm text-zinc-400">
                Use the left panel to add text inputs, choices, ratings, dates, and more.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
