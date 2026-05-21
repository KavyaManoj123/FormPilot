import { z } from "zod";

const fieldTypes = [
  "SHORT_TEXT",
  "LONG_TEXT",
  "EMAIL",
  "PHONE",
  "SINGLE_CHOICE",
  "MULTI_SELECT",
  "DROPDOWN",
  "DATE",
  "RATING",
  "FILE_UPLOAD",
] as const;

const formStatuses = ["DRAFT", "LIVE", "CLOSED"] as const;

export const formFieldSchema = z.object({
  id: z.string().min(1),
  type: z.enum(fieldTypes),
  label: z.string().trim().min(1, "Field label is required"),
  placeholder: z.string().default(""),
  helperText: z.string().default(""),
  required: z.boolean().default(false),
  hidden: z.boolean().default(false),
  options: z.array(z.string().trim().min(1)).default([]),
  order: z.number().int().min(0),
});

export const formSchema = z.object({
  title: z.string().trim().min(1, "Form title is required"),
  description: z.string().default(""),
  status: z.enum(formStatuses).default("DRAFT"),
  redirectUrl: z
    .string()
    .trim()
    .url("Redirect URL must be a valid URL")
    .or(z.literal(""))
    .default(""),
  fields: z
    .array(formFieldSchema)
    .min(1, "Add at least one field to save this form"),
});

export type FormSchemaInput = z.infer<typeof formSchema>;
