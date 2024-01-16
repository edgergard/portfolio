import emailjs from '@emailjs/browser';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Slide } from 'react-toastify';

const API = {
  SERVICE_ID: "service_9ypjm36",
  TEMPLATE_ID: "template_n3pdjbm",
  USER_PUBLIC_KEY: "bbMwWA3DIZLu3o3xf",
};

const ContactForm = () => {
  const { handleSubmit, register, reset, } = useForm();
  const form = useRef<HTMLFormElement | null>(null);

  const showToast = () => toast('Message was sent successfully.', {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    transition: Slide,
  });

  const sendEmail = () => {
    if (form.current) {
      emailjs.sendForm(
        API.SERVICE_ID,
        API.TEMPLATE_ID,
        form.current,
        API.USER_PUBLIC_KEY,
      );
    }
  };
  
  const onSubmit = () => {
    sendEmail();
    reset();
    showToast();
  };

  return (
    <div> 
      <form
        ref={form}
        onSubmit={handleSubmit(onSubmit)} 
        className="flex flex-col gap-y-6"
      >
        <div>
          <label className="text-sm text-white font-medium block mb-2">
            Your Email
          </label>
      
          <input
            {...register('user_email', {
              required: true,
            })}
            type="email"
            placeholder="user123@gmail.com"
            className="
              w-full py-2 px-3 rounded-lg bg-form-bg text-sm text-white
              outline outline-1 outline-form-outline focus:outline-white"
          />
        </div>

        <div>
          <label className="text-sm text-white font-medium block mb-2">
            Subject
          </label>
    
          <input 
            {...register('subject', {
              required: true,
            })}
            type="text"
            placeholder="Hi"
            autoComplete="off"
            className="
              w-full py-2 px-3 rounded-lg bg-form-bg text-sm text-white
              outline outline-1 outline-form-outline focus:outline-white"
          />
        </div>

        <div>
          <label className="text-sm text-white font-medium block mb-2">
            Message
          </label>
    
          <textarea
            {...register('message', {
              required: true,
            })}
            placeholder="Let's talk about..."
            autoComplete="off"
            className="
              w-full py-2 px-3 rounded-lg bg-form-bg text-sm text-white
              outline outline-1 outline-form-outline focus:outline-white
              resize-none"
          />
        </div>

        <button
          type="submit"
          className="
            py-2.5 px-5 text-white font-medium
            bg-button-main rounded-lg hover:bg-blood transition-all"
        >
          Send Message
        </button>
      </form>
    </div>
  );
};  

export default ContactForm;