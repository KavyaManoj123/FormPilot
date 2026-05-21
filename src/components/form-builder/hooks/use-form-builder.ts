'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  BuilderPayload,
  FormBuilderController,
  FormField,
  FormRecord,
  FormStatus,
  FieldType,
} from '../types';

const fieldTemplates: Record<
  FieldType,
  Omit<FormField, 'id' | 'order'>
> = {
  SHORT_TEXT: {
    type: 'SHORT_TEXT',
    label: 'Full name',
    placeholder: 'e.g. John Doe',
    helperText: '',
    required: false,
    hidden: false,
    options: [],
  },
  LONG_TEXT: {
    type: 'LONG_TEXT',
    label: 'Tell us more',
    placeholder: 'Write your answer here',
    helperText: '',
    required: false,
    hidden: false,
    options: [],
  },
  EMAIL: {
    type: 'EMAIL',
    label: 'Email address',
    placeholder: 'you@example.com',
    helperText: '',
    required: true,
    hidden: false,
    options: [],
  },
  PHONE: {
    type: 'PHONE',
    label: 'Phone number',
    placeholder: '+1 (555) 123-4567',
    helperText: '',
    required: false,
    hidden: false,
    options: [],
  },
  SINGLE_CHOICE: {
    type: 'SINGLE_CHOICE',
    label: 'How did you hear about us?',
    placeholder: '',
    helperText: '',
    required: false,
    hidden: false,
    options: ['Instagram', 'Friend', 'Google'],
  },
  MULTI_SELECT: {
    type: 'MULTI_SELECT',
    label: 'Which services are you interested in?',
    placeholder: '',
    helperText: '',
    required: false,
    hidden: false,
    options: ['Design', 'Development', 'Marketing'],
  },
  DROPDOWN: {
    type: 'DROPDOWN',
    label: 'Choose a preferred option',
    placeholder: 'Select one option',
    helperText: '',
    required: false,
    hidden: false,
    options: ['Option 1', 'Option 2', 'Option 3'],
  },
  DATE: {
    type: 'DATE',
    label: 'Preferred date',
    placeholder: '',
    helperText: '',
    required: false,
    hidden: false,
    options: [],
  },
  RATING: {
    type: 'RATING',
    label: 'Rate your experience',
    placeholder: '',
    helperText: '',
    required: false,
    hidden: false,
    options: ['5'],
  },
  FILE_UPLOAD: {
    type: 'FILE_UPLOAD',
    label: 'Upload a file',
    placeholder: '',
    helperText: 'Accepted formats can be explained here',
    required: false,
    hidden: false,
    options: [],
  },
};

function normalizeField(field: FormField, index: number): FormField {
  return {
    ...field,
    placeholder: field.placeholder ?? '',
    helperText: field.helperText ?? '',
    required: field.required ?? false,
    hidden: field.hidden ?? false,
    options: field.options ?? [],
    order: index,
  };
}

function getInitialState(initialForm?: FormRecord) {
  return {
    formId: initialForm?.id ?? null,
    title: initialForm?.title ?? 'Untitled form',
    description: initialForm?.description ?? '',
    status: initialForm?.status ?? 'DRAFT',
    redirectUrl: initialForm?.redirectUrl ?? '',
    fields: (initialForm?.fields ?? []).map(normalizeField),
  };
}

export function useFormBuilder(initialForm?: FormRecord): FormBuilderController {
  const router = useRouter();
  const initialState = getInitialState(initialForm);

  const [formId, setFormId] = useState<string | null>(initialState.formId);
  const [title, setTitle] = useState(initialState.title);
  const [description, setDescription] = useState(initialState.description);
  const [status, setStatus] = useState<FormStatus>(initialState.status);
  const [redirectUrl, setRedirectUrl] = useState(initialState.redirectUrl);
  const [fields, setFields] = useState<FormField[]>(initialState.fields);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    initialState.fields[0]?.id ?? null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const selectedField =
    fields.find((field) => field.id === selectedFieldId) ?? null;

  const reindexFields = (nextFields: FormField[]) =>
    nextFields.map((field, index) => ({
      ...field,
      order: index,
    }));

  const addField = (type: FieldType) => {
    const template = fieldTemplates[type];
    const newField: FormField = {
      id: crypto.randomUUID(),
      ...template,
      order: fields.length,
    };

    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newField.id);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...updates } : field))
    );
  };

  const deleteField = (id: string) => {
    setFields((prev) => {
      const nextFields = reindexFields(prev.filter((field) => field.id !== id));

      if (selectedFieldId === id) {
        setSelectedFieldId(nextFields[0]?.id ?? null);
      }

      return nextFields;
    });
  };

  const duplicateField = (id: string) => {
    const source = fields.find((field) => field.id === id);

    if (!source) {
      return;
    }

    const duplicate: FormField = {
      ...source,
      id: crypto.randomUUID(),
      label: `${source.label} copy`,
    };

    const sourceIndex = fields.findIndex((field) => field.id === id);
    const nextFields = [...fields];

    nextFields.splice(sourceIndex + 1, 0, duplicate);

    const normalized = reindexFields(nextFields);

    setFields(normalized);
    setSelectedFieldId(duplicate.id);
  };

  const updateOption = (fieldId: string, index: number, value: string) => {
    const field = fields.find((item) => item.id === fieldId);

    if (!field) {
      return;
    }

    const nextOptions = [...field.options];
    nextOptions[index] = value;

    updateField(fieldId, { options: nextOptions });
  };

  const addOption = (fieldId: string) => {
    const field = fields.find((item) => item.id === fieldId);

    if (!field) {
      return;
    }

    updateField(fieldId, {
      options: [...field.options, `Option ${field.options.length + 1}`],
    });
  };

  const removeOption = (fieldId: string, index: number) => {
    const field = fields.find((item) => item.id === fieldId);

    if (!field) {
      return;
    }

    updateField(fieldId, {
      options: field.options.filter((_, optionIndex) => optionIndex !== index),
    });
  };

  const getPayload = (nextStatus = status): BuilderPayload => ({
    title: title.trim() || 'Untitled form',
    description: description.trim(),
    status: nextStatus,
    redirectUrl: redirectUrl.trim(),
    fields: reindexFields(fields),
  });

  const saveForm = async (nextStatus = status) => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const payload = getPayload(nextStatus);
      const endpoint = formId ? `/api/forms/${formId}` : '/api/forms';
      const method = formId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to save form');
      }

      setFormId(data.id);
      setStatus(nextStatus);
      setFields((data.fields ?? payload.fields).map(normalizeField));
      setSaveMessage(
        nextStatus === 'LIVE'
          ? 'Form published successfully'
          : 'Changes saved successfully'
      );

      if (!formId) {
        router.replace(`/forms/${data.id}/edit`);
      }

      router.refresh();

      return data.id as string;
    } catch (error) {
      setSaveMessage(
        error instanceof Error ? error.message : 'Unable to save form'
      );
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formId,
    title,
    setTitle,
    description,
    setDescription,
    status,
    setStatus,
    redirectUrl,
    setRedirectUrl,
    fields,
    addField,
    updateField,
    deleteField,
    duplicateField,
    updateOption,
    addOption,
    removeOption,
    saveForm,
    isSaving,
    saveMessage,
    selectedField,
    selectedFieldId,
    setSelectedFieldId,
  };
}
