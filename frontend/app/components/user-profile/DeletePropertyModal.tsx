import type { PropertyData } from "@free-real-estate/shared";
import type { ModalProps } from "./modalTypes";

import { useEffect } from "react";
import { useFetcher } from "react-router";
import { motion, AnimatePresence } from "motion/react";

import { GoX } from "react-icons/go";

export default function DeletePropertyModal({
  deletePropertyProps,
  property,
}: {
  deletePropertyProps: ModalProps;
  property: PropertyData | null;
}) {
  const { isDialogOpen, dialogRef, openCloseDialog } = deletePropertyProps;

  const fetcher = useFetcher<{ success?: boolean; error?: string }>();

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      openCloseDialog(false);
    }
  }, [fetcher.state, fetcher.data]);

  const handleCloseDialog = (e: React.SyntheticEvent) => {
    e.preventDefault();

    openCloseDialog(false);
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCloseDialog}
      className="inset-0 w-full h-full max-w-none max-h-none
      backdrop:bg-transparent bg-transparent
      overflow-hidden border-none outline-none"
    >
      <AnimatePresence onExitComplete={() => dialogRef.current?.close()}>
        {isDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="flex items-center justify-center w-full h-full relative"
          >
            {/* Custom backdrop */}
            <div
              className="absolute inset-0 bg-black/48 backdrop-blur-[1px]"
              onClick={handleCloseDialog}
            />

            <motion.div
              initial={{ scale: 0.97 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              exit={{ scale: 0.99, transition: { duration: 0.15 } }}
              className="relative z-10"
            >
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <button onClick={handleCloseDialog} className="modal-cross">
                  <GoX size={20} className="text-amber-800" />
                </button>

                <h2 className="modal-title">Delete Listing</h2>

                <fetcher.Form method="POST" className="stack-4 mt-4">
                  <input type="hidden" name="intent" value="property-delete" />
                  <input
                    type="hidden"
                    name="propertyId"
                    value={property?.id ?? ""}
                  />

                  {fetcher.data?.error ? (
                    <p className="form-error">{fetcher.data.error}</p>
                  ) : (
                    <div className="form-message-space" />
                  )}

                  <p className="text-amber-900">
                    <b>{property?.title}</b> will be removed for good, along
                    with every conversation and bookmark that pointed at it.
                  </p>

                  <p className="text-sm text-amber-800/74">
                    This cannot be undone.
                  </p>

                  <fieldset className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseDialog}
                      className="modal-cancel-btn"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={fetcher.state !== "idle"}
                      className="px-5 py-2 bg-rose-600/94 text-white font-medium
                      rounded-md shadow-md hover:bg-rose-800/94
                      transition-colors duration-150 disabled:opacity-74"
                    >
                      {fetcher.state !== "idle" ? "Deleting..." : "Delete"}
                    </button>
                  </fieldset>
                </fetcher.Form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}
