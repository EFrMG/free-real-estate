export interface ModalProps {
  isDialogOpen: boolean;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  openCloseDialog: (opens: boolean) => void;
}
