import type { MouseEvent } from 'react';
import { CheckIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

type Props = { kind: 'success' | 'error'; label: string; text: string };

/** What react-toastify passes a custom close button. */
type CloseProps = { closeToast: (event: MouseEvent<HTMLElement>) => void; ariaLabel?: string };

/**
 * The contact form's toast body: the glass panel look of the form itself (styles in styles.css,
 * .contact-toast), an icon disc, a mono caps label and one line of copy.
 */
export const ContactToast = ({ kind, label, text }: Props) => {
  const Icon = kind === 'success' ? CheckIcon : ExclamationTriangleIcon;

  return (
    <div className="flex items-start gap-3" data-testid={`contact-toast-${kind}`}>
      <span aria-hidden className={`contact-toast-icon contact-toast-icon--${kind}`}>
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`contact-toast-label contact-toast-label--${kind}`}>{label}</p>
        <p className="contact-toast-text">{text}</p>
      </div>
    </div>
  );
};

/** The toast's close control: a small cross in the label grey. */
export const ContactToastClose = ({ closeToast, ariaLabel }: CloseProps) => (
  <button
    type="button"
    onClick={closeToast}
    aria-label={ariaLabel ?? 'close'}
    className="contact-toast-close"
  >
    <XMarkIcon className="h-3.5 w-3.5" strokeWidth={2} />
  </button>
);
