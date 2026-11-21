import emailjs from '@emailjs/browser';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Slide } from 'react-toastify';
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import { GLASS } from '../layout/Section';
import { TELEGRAM_URL } from '../../data/content';
import { ArrowUpRightIcon } from './icons';

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

  // Line-only fields: a bottom hairline that turns wine-3 on focus; keyboard focus also thickens it.
  const fieldClass = (invalid: boolean) =>
    'w-full rounded-none border-0 border-b bg-transparent px-0 pb-2.5 pt-2 text-base text-white outline-none '
    + 'transition-[border-color,box-shadow] duration-200 placeholder:text-white/40 focus:border-white '
    + 'focus-visible:shadow-[0_1px_0_0_#FFFFFF] '
    + (invalid ? 'border-[#FF8A9B]' : 'border-white/20');
  const labelClass = 'grid gap-1.5';
  const captionClass = 'font-mono text-xs uppercase tracking-[.07em] text-white/60';
  const errorClass = 'text-sm text-[#FFB3BF]';

  return (
    <div className="self-start">
      <form
        ref={form}
        onSubmit={handleSubmit(onSubmit)}
        className={`${GLASS} grid gap-[22px] px-7 pb-6 pt-7`}
        noValidate
      >
        <div>
          <h3 className="text-xl font-medium tracking-[-0.01em] text-white">{t('contact_form_title')}</h3>
          <p className="mt-2 inline-flex items-center gap-2 font-mono text-[13px] text-white/75">
            <i
              aria-hidden="true"
              className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#22C55E] shadow-[0_0_0_4px_rgba(34,197,94,.22)]"
            />
            {t('contact_form_status')}
          </p>
        </div>

        <label className={labelClass}>
          <span className={captionClass}>{t('email')}</span>
          <input
            {...register('email')}
            type="email"
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
            rows={3}
            placeholder={t('message_placeholder')}
            autoComplete="off"
            className={`${fieldClass(!!errors.message)} resize-none`}
            aria-invalid={!!errors.message}
          />
          {errors.message && <span className={errorClass}>{t(errors.message.message || '')}</span>}
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={
              'inline-flex items-center gap-1.5 rounded font-mono text-[13px] text-white/75 transition-colors hover:text-white '
              + 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
            }
          >
            {t('contact_form_telegram')}
            <ArrowUpRightIcon size={14} />
          </a>
          <Button type="submit" size="sm" disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? t('send_sending') : `${t('send_message')} →`}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
