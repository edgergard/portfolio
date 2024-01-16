import ContactForm from "./ContactForm";
import { GithubLink, LinkedinLink, TelegramLink } from "./LinkIcons";

const PHONE = '+380635383049';
const EMAIL = 'oleksandrbryksin@gmail.com';

const Contact = () => {
  return (
    <section
      id="contact"
      className="grid lg:grid-cols-2 gap-y-12 pt-12 md:pt-24"
    >
      <div>
        <h1 className="text-xl font-bold text-white mb-2">
          {`Let's Connect`}
        </h1>

        <p className="text-text-secondary max-w-md mb-4">
          {`I'm currently looking for new opportunities, my inbox is always open.`}
        </p>
      
        <p className="mb-6 text-lg text-white">
          {`${PHONE} / ${EMAIL}`}
        </p>

        <ul className="flex gap-x-8">
          <li>
            <GithubLink />
          </li>

          <li>
            <TelegramLink />
          </li>
  
          <li>
            <LinkedinLink />
          </li>
        </ul>
      </div>

      <ContactForm />
    </section>
  );
};

export default Contact;