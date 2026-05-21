'use client';

import { useState } from 'react';

import { FormRecord } from './types';

interface PublicFormProps {
  form: FormRecord;
}

export default function PublicForm({ form }: PublicFormProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const visibleFields = form.fields.filter((field) => !field.hidden);

  const updateAnswer = (fieldId: string, value: string | string[]) => {
    setAnswers((current) => ({
      ...current,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`/api/forms/${form.id}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to submit form');
      }

      if (form.redirectUrl) {
        window.location.href = form.redirectUrl;
        return;
      }

      setAnswers({});
      setMessage('Response submitted successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-3xl rounded-[32px] border border-zinc-800 bg-[#171717] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
    >
      <div className="border-b border-zinc-800 pb-6">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">
          {form.title}
        </h1>
        {form.description ? (
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-400">
            {form.description}
          </p>
        ) : null}
      </div>

      <div className="mt-8 space-y-6">
        {visibleFields.map((field) => (
          <div
            key={field.id}
            className="rounded-[28px] border border-zinc-800 bg-black/20 p-5"
          >
            <label className="block text-lg font-semibold text-white">
              {field.label}
              {field.required ? <span className="ml-1 text-rose-400">*</span> : null}
            </label>

            {field.helperText ? (
              <p className="mt-2 text-sm text-zinc-500">{field.helperText}</p>
            ) : null}

            <div className="mt-4">
              {field.type === 'LONG_TEXT' ? (
                <textarea
                  value={(answers[field.id] as string) ?? ''}
                  onChange={(event) => updateAnswer(field.id, event.target.value)}
                  rows={5}
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-blue-500/70"
                  placeholder={field.placeholder}
                />
              ) : field.type === 'SINGLE_CHOICE' ? (
                <div className="space-y-2">
                  {field.options.map((option) => (
                    <label key={option} className="flex items-center gap-3 rounded-2xl border border-zinc-800 px-4 py-3 text-zinc-200">
                      <input
                        type="radio"
                        name={field.id}
                        checked={answers[field.id] === option}
                        onChange={() => updateAnswer(field.id, option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              ) : field.type === 'MULTI_SELECT' ? (
                <div className="space-y-2">
                  {field.options.map((option) => {
                    const current = (answers[field.id] as string[]) ?? [];

                    return (
                      <label key={option} className="flex items-center gap-3 rounded-2xl border border-zinc-800 px-4 py-3 text-zinc-200">
                        <input
                          type="checkbox"
                          checked={current.includes(option)}
                          onChange={(event) =>
                            updateAnswer(
                              field.id,
                              event.target.checked
                                ? [...current, option]
                                : current.filter((item) => item !== option)
                            )
                          }
                        />
                        {option}
                      </label>
                    );
                  })}
                </div>
              ) : field.type === 'DROPDOWN' ? (
                <select
                  value={(answers[field.id] as string) ?? ''}
                  onChange={(event) => updateAnswer(field.id, event.target.value)}
                  className="h-12 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 text-white outline-none focus:border-blue-500/70"
                >
                  <option value="">{field.placeholder || 'Select an option'}</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === 'DATE' ? (
                <input
                  type="date"
                  value={(answers[field.id] as string) ?? ''}
                  onChange={(event) => updateAnswer(field.id, event.target.value)}
                  className="h-12 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 text-white outline-none focus:border-blue-500/70"
                />
              ) : field.type === 'RATING' ? (
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = String(index + 1);

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateAnswer(field.id, value)}
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-sm font-semibold transition ${
                          answers[field.id] === value
                            ? 'border-blue-500 bg-blue-500/12 text-blue-200'
                            : 'border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-zinc-500'
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              ) : field.type === 'FILE_UPLOAD' ? (
                <div className="rounded-2xl border border-dashed border-zinc-700 px-4 py-6 text-sm text-zinc-500">
                  File uploads are not stored yet. Use this as a visual placeholder for now.
                </div>
              ) : (
                <input
                  type={field.type === 'EMAIL' ? 'email' : field.type === 'PHONE' ? 'tel' : 'text'}
                  value={(answers[field.id] as string) ?? ''}
                  onChange={(event) => updateAnswer(field.id, event.target.value)}
                  className="h-12 w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 text-white outline-none focus:border-blue-500/70"
                  placeholder={field.placeholder}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-500">{message}</p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Submitting...' : 'Submit response'}
        </button>
      </div>
    </form>
  );
}
