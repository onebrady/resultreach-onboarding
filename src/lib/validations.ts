import { z } from "zod"

// ─── Admin: Create Client ────────────────────────────────────────
export const createClientSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().optional(),
  industry: z.string().optional(),
  websiteUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  assignedToId: z.string().optional(),
})

// ─── Onboarding: Contact Info ────────────────────────────────────
const contactSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
}).optional()

// ─── Onboarding: Form Sections ───────────────────────────────────
export const step1Schema = z.object({
  companyLegalName: z.string().optional(),
  targetTerritory: z.string().optional(),
  industries: z.string().optional(),
})

export const step2Schema = z.object({
  services: z.string().min(1, "Please list your services"),
  specializedServices: z.string().optional(),
})

export const step3Schema = z.object({
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  opportunities: z.string().optional(),
  threats: z.string().optional(),
})

export const step4Schema = z.object({
  marketingContact: contactSchema,
  salesContact: contactSchema,
  operationsContact: contactSchema,
  decisionMaker: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    role: z.string().optional(),
  }).optional(),
  preferredComm: z.string().optional(),
})

export const step5Schema = z.object({
  activeChannels: z.array(z.string()).optional(),
  monthlyBudget: z.string().optional(),
  bestPerforming: z.string().optional(),
  crmSystem: z.string().optional(),
  erpSystem: z.string().optional(),
  crmMaturity: z.string().optional(),
})

export const step6Schema = z.object({
  platformAccess: z.record(z.string(), z.string()).optional(),
})

export const step7Schema = z.object({
  sixMonthGoals: z.string().optional(),
  websiteChanges: z.string().optional(),
  additionalNotes: z.string().optional(),
})

// Combined submission schema (for final validation)
export const submissionSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .merge(step6Schema)
  .merge(step7Schema)

export type CreateClientInput = z.infer<typeof createClientSchema>
export type SubmissionInput = z.infer<typeof submissionSchema>
