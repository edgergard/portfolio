import emailjs from '@emailjs/browser';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Slide } from 'react-toastify';
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import Loader from '../Loader';
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

const FormSchema = z.object({
  email: z
    .string({ required_error: 'form_error_submit' })
    .min(1, { message: 'form_error_email' })
    .email(),
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

  const showToast = (
    success: boolean
  ) => {
    success ? (toast(t('message_success'), {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Slide,
    })) : (
      toast.error(t('message_error'), {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Slide,
      })
    );
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

  return (
    <div> 
      <form
        ref={form}
        onSubmit={handleSubmit(onSubmit)} 
        className="flex flex-col gap-y-1"
      >
        <div>
          <label className="text-sm text-white font-medium block mb-2">
            {t('email')}
          </label>
      
          <input
            {...register("email")}
            placeholder="User123@gmail.com"
            className={`w-full py-2 px-3 rounded-lg bg-form-bg text-sm 
            text-white outline outline-1 outline-form-outline
            ${errors.email ? 'focus:outline-red-1': 'focus:outline-white'}`}
          />
  
          {errors.email ? (
            <div className="text-red-1 pt-1">
              {t(errors.email.message || '')}
            </div>
          ) : (
            <div className="pt-1 h-7" />
          )}
        </div>

        <div>
          <label className="text-sm text-white font-medium block mb-2">
            {t('subject')}
          </label>
    
          <input 
            {...register("subject")}
            type="text"
            placeholder={t('subject_placeholder')}
            autoComplete="off"
            className={`w-full py-2 px-3 rounded-lg bg-form-bg text-sm 
            text-white outline outline-1 outline-form-outline
            ${errors.subject ? 'focus:outline-red-1': 'focus:outline-white'}`}
          />

          {errors.subject ? (
            <div className="text-red-1 pt-1">
              {t(errors.subject.message || '')}
            </div>
          ) : (
            <div className="pt-1 h-7" />
          )}
        </div>

        <div className="pb-2">
          <label className="text-sm text-white font-medium block mb-2">
            {t('message')}
          </label>
    
          <textarea
            {...register("message")}
            placeholder={t('message_placeholder')}
            autoComplete="off"
            className={`w-full py-2 px-3 rounded-lg bg-form-bg text-sm 
            text-white outline outline-1 outline-form-outline resize-none
            ${errors.message ? 'focus:outline-red-1': 'focus:outline-white'}`}
          />

          {errors.message ? (
            <div className="text-red-1">{t(errors.message.message || '')}</div>
          ) : (
            <div className="pt-2 h-6" />
          )}
        </div>
          
        <button
          type="submit"
          className="
            flex items-center justify-center
            py-2.5 px-5 text-white font-medium
            bg-button-main rounded-lg hover:bg-blood transition-all"
        >
          {isLoading ? <Loader /> : t('send_message')}
        </button>
      </form>
    </div>
  );
};  

export default ContactForm;