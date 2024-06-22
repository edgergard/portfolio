import emailjs from '@emailjs/browser';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Slide } from 'react-toastify';
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import Loader from '../Loader';

const API = {
  SERVICE_ID: "service_9ypjm36",
  TEMPLATE_ID: "template_n3pdjbm",
  USER_PUBLIC_KEY: "bbMwWA3DIZLu3o3xf",
};

const FormSchema = z.object({
  email: z
    .string({ required_error: 'Email is invalid' })
    .min(1, { message: "Email is required" })
    .email(),
  subject: z
    .string()
    .min(1, { message: "Subject is required" }),
  message: z
    .string()
    .min(1, { message: "Message is required" }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const ContactForm = () => {
  const { 
    handleSubmit, 
    register, 
    reset,
    formState: { errors },
  } = useForm<FormSchemaType>({ resolver: zodResolver(FormSchema)});
  const form = useRef<HTMLFormElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const showToast = (
    sucess: boolean
  ) => {
    sucess ? (toast('Message was successfully sent.', {
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
      toast.error('Unexpected error occured.', {
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
            Email
          </label>
      
          <input
            {...register("email")}
            placeholder="User123@gmail.com"
            className={
              classNames(
                'w-full py-2 px-3 rounded-lg bg-form-bg text-sm text-white ',
                'outline outline-1 outline-form-outline focus:outline-white', {
                  'focus:outline-red-1': errors.email
                }
              )}
          />
  
          {errors.email ? (
            <div className="text-red-1 pt-1">{errors.email.message}</div>
          ) : (
            <div className="pt-1 h-7" />
          )}
        </div>

        <div>
          <label className="text-sm text-white font-medium block mb-2">
            Subject
          </label>
    
          <input 
            {...register("subject")}
            type="text"
            placeholder="Hi"
            autoComplete="off"
            className={
              classNames(
                'w-full py-2 px-3 rounded-lg bg-form-bg text-sm text-white ',
                'outline outline-1 outline-form-outline focus:outline-white', {
                  'focus:outline-red-1': errors.subject
                }
              )}
          />

          {errors.subject ? (
            <div className="text-red-1 pt-1">{errors.subject.message}</div>
          ) : (
            <div className="pt-1 h-7" />
          )}
        </div>

        <div className="pb-2">
          <label className="text-sm text-white font-medium block mb-2">
            Message
          </label>
    
          <textarea
            {...register("message")}
            placeholder="Let's talk about..."
            autoComplete="off"
            className={
              classNames(
                'w-full py-2 px-3 rounded-lg bg-form-bg text-sm text-white',
                'outline outline-1 outline-form-outline focus:outline-white',
                'resize-none',
                {
                  'focus:outline-red-1': errors.message
                }
              )}
          />

          {errors.message ? (
            <div className="text-red-1">{errors.message.message}</div>
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
          {isLoading ? <Loader /> : 'Send Message'}
        </button>
      </form>
    </div>
  );
};  

export default ContactForm;