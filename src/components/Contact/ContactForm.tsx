import emailjs from '@emailjs/browser';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Slide } from 'react-toastify';
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

const {
  VITE_EMAILJS_SERVICE_ID,
  VITE_EMAILJS_TEMPLATE_ID,
  VITE_EMAILJS_KEY,
} = import.meta.env;

const API = {
  SERVICE_ID: VITE_EMAILJS_SERVICE_ID,
  TEMPLATE_ID: VITE_EMAILJS_TEMPLATE_ID,
  USER_PUBLIC_KEY: VITE_EMAILJS_KEY,
};

const TOAST_CLASS = '!rounded-xl !border !border-line !bg-[#111113] !font-sans !text-ink';

const FormSchema = z.object({
  email: z
    .string({ required_error: 'form_error_submit' })
    .min(1, { message: 'form_error_email' })
    .email({ message: 'form_error_submit' }),
  subject: z
    .string()
    .min(1, { message: 'form_error_subject' }),
  message: z
    .string()
    .min(1, { message: 'form_error_message' }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const ContactForm = () => {
  const { t } = useTranslation();
  const { 
    handleSubmit, 
    register, 
    reset,
    formState: { errors },
  } = useForm<FormSchemaType>({ resolver: zodResolver(FormSchema)});
  const form = useRef<HTMLFormElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const showToast = (success: boolean) => {
    const options = {
      position: 'bottom-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'dark',
      className: TOAST_CLASS,
      transition: Slide,
    } as const;

    if (success) {
      toast(t('message_success'), options);
    } else {
      toast.error(t('message_error'), options);
    }
  };

  const sendEmail = async () => {
    if (form.current) {
      setIsLoading(true);
      try {
        await emailjs.sendForm(
          API.SERVICE_ID,
          API.TEMPLATE_ID,
          form.current,
          API.USER_PUBLIC_KEY,
        );
        showToast(true);
        reset();
      } catch (error) {
        showToast(false); 
      }

      setIsLoading(false);
    }
  };
  
  const onSubmit = () => {
    sendEmail();
  };

  const fieldClass = (invalid: boolean) =>
    `w-full rounded-xl border bg-[#111113] px-4 py-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-muted focus-visible:ring-2 focus-visible:ring-wine-3 focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
      invalid ? 'border-wine-3' : 'border-[#232327] focus:border-wine'
    }`;
  const labelClass = 'grid gap-2';
  const captionClass = 'font-mono text-xs uppercase tracking-[.06em] text-muted-2';
  const errorClass = 'text-sm text-wine-3';

  return (
    <form ref={form} onSubmit={handleSubmit(onSubmit)} className="grid content-start gap-3.5" noValidate>
      <label className={labelClass}>
        <span className={captionClass}>{t('email')}</span>
        <input
          {...register('email')}
          placeholder="you@company.com"
          className={fieldClass(!!errors.email)}
          aria-invalid={!!errors.email}
        />
        {errors.email && <span className={errorClass}>{t(errors.email.message || '')}</span>}
      </label>

      <label className={labelClass}>
        <span className={captionClass}>{t('subject')}</span>
        <input
          {...register('subject')}
          type="text"
          placeholder={t('subject_placeholder')}
          autoComplete="off"
          className={fieldClass(!!errors.subject)}
          aria-invalid={!!errors.subject}
        />
        {errors.subject && <span className={errorClass}>{t(errors.subject.message || '')}</span>}
      </label>

      <label className={labelClass}>
        <span className={captionClass}>{t('message')}</span>
        <textarea
          {...register('message')}
          placeholder={t('message_placeholder')}
          autoComplete="off"
          className={`${fieldClass(!!errors.message)} min-h-[120px] resize-y`}
          aria-invalid={!!errors.message}
        />
        {errors.message && <span className={errorClass}>{t(errors.message.message || '')}</span>}
      </label>

      <button
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
        className="mt-1.5 justify-self-start rounded-full bg-wine px-6 py-[15px] text-sm font-medium text-ink transition-colors hover:bg-wine-2 disabled:cursor-wait disabled:opacity-70"
      >
        {isLoading ? t('send_sending') : `${t('send_message')} →`}
      </button>
    </form>
  );
};

export default ContactForm;