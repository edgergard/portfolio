import { z } from 'zod';

/** Where the contact form posts (src/app/api/contact/route.ts). */
export const CONTACT_ENDPOINT = '/api/contact';

/** Upper bounds, so the endpoint can't be used to mail out arbitrarily large payloads. */
export const CONTACT_LIMITS = { email: 254, subject: 200, message: 5000 } as const;

/**
 * The contact form fields, shared by the form (client validation, translated messages by key)
 * and the API route (the same rules again on the server).
 */
export const ContactSchema = z.object({
  email: z
    .string({ required_error: 'form_error_submit' })
    .trim()
    .min(1, { message: 'form_error_email' })
    .max(CONTACT_LIMITS.email, { message: 'form_error_submit' })
    .email({ message: 'form_error_submit' }),
  subject: z
    .string()
    .trim()
    .min(1, { message: 'form_error_subject' })
    .max(CONTACT_LIMITS.subject, { message: 'form_error_subject' }),
  message: z
    .string()
    .trim()
    .min(1, { message: 'form_error_message' })
    .max(CONTACT_LIMITS.message, { message: 'form_error_message' }),
});

export type ContactFields = z.infer<typeof ContactSchema>;

/**
 * Honeypot: a field people never see or fill (hidden, out of the tab order); bots that fill
 * every input do. A request with it set is accepted and silently dropped.
 */
export const HONEYPOT_FIELD = 'company';
