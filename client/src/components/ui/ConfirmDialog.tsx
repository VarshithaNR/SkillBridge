import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eyebrow?: string;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'destructive';
  loading?: boolean;
}

/** Confirmation dialog for high-stakes actions (payout release, rejection, etc.). */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  eyebrow = 'Confirm action',
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={eyebrow}
      title={title}
      footer={
        <>
          <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'destructive' ? 'destructive' : 'primary'}
            size="md"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description}
    </Modal>
  );
}
