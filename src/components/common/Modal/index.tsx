import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import clsx from 'clsx';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  size = 'md',
  closeOnOverlay = true,
  closeOnEsc = true,
  showCloseButton = true,
  children,
  footer,
  className,
}) => {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);
  return createPortal(
    <dialog
      ref={ref}
      className={clsx(styles.modal, styles[size], className)}
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : '详细信息'}
      onCancel={event => {
        event.preventDefault();
        if (closeOnEsc) onClose();
      }}
      onClick={event => {
        if (event.target === event.currentTarget && closeOnOverlay) onClose();
      }}
    >
      {open && (
        <div className={styles.inner}>
          {(title || showCloseButton) && (
            <div className={styles.header}>
              {title && (
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
              )}
              {showCloseButton && (
                <button
                  className={styles.closeBtn}
                  onClick={onClose}
                  aria-label="关闭"
                  type="button"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          )}
          <div className={styles.content}>{children}</div>
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      )}
    </dialog>,
    document.body
  );
};
export default Modal;
