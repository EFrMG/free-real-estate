export type ModalProps = {
  isDialogOpen: boolean;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  openCloseDialog: (opens: boolean) => void;
};
