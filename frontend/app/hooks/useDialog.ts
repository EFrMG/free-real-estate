import { useState, useRef } from "react";

export default function useDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openCloseDialog = (open: boolean) => {
    if (open) {
      setIsDialogOpen(true);
      dialogRef.current?.showModal();
    } else {
      setIsDialogOpen(false);
      // Wait for complete motion exit
    }
  };

  return {
    isDialogOpen,
    dialogRef,
    openCloseDialog,
  };
}
