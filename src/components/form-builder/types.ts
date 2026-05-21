import type { Dispatch, SetStateAction } from 'react';

export type FieldType =
  | 'SHORT_TEXT'
  | 'LONG_TEXT'
  | 'EMAIL'
  | 'PHONE'
  | 'SINGLE_CHOICE'
  | 'MULTI_SELECT'
  | 'DROPDOWN'
  | 'DATE'
  | 'RATING'
  | 'FILE_UPLOAD';

export type FormStatus =
  | 'DRAFT'
  | 'LIVE'
  | 'CLOSED';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string;
  helperText: string;
  required: boolean;
  hidden: boolean;
  options: string[];
  order: number;
}

export interface FormRecord {
  id: string;
  title: string;
  description: string;
  status: FormStatus;
  redirectUrl: string;
  createdAt: string;
  updatedAt: string;
  fields: FormField[];
  responsesCount?: number;
}

export interface BuilderPayload {
  title: string;
  description: string;
  status: FormStatus;
  redirectUrl: string;
  fields: FormField[];
}

export interface FormBuilderController {
  formId: string | null;
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  status: FormStatus;
  setStatus: Dispatch<SetStateAction<FormStatus>>;
  redirectUrl: string;
  setRedirectUrl: Dispatch<SetStateAction<string>>;
  fields: FormField[];
  addField: (type: FieldType) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  deleteField: (id: string) => void;
  duplicateField: (id: string) => void;
  updateOption: (fieldId: string, index: number, value: string) => void;
  addOption: (fieldId: string) => void;
  removeOption: (fieldId: string, index: number) => void;
  saveForm: (nextStatus?: FormStatus) => Promise<string | null>;
  isSaving: boolean;
  saveMessage: string;
  selectedField: FormField | null;
  selectedFieldId: string | null;
  setSelectedFieldId: Dispatch<SetStateAction<string | null>>;
}
