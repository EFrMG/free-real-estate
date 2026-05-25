import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import type { ModalProps } from "./modalTypes";

import { GoEye, GoEyeClosed, GoX } from "react-icons/go";

export default function ChangePasswordModal({
  changePasswordProps,
}: {
  changePasswordProps: ModalProps;
}) {
  const { isDialogOpen, dialogRef, openCloseDialog } = changePasswordProps;

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        openCloseDialog(false);
      }}
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
              className="absolute inset-0 bg-black/46 backdrop-blur-[1px]"
              onClick={() => openCloseDialog(false)}
            />

            <motion.div
              initial={{ scale: 0.97 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              exit={{ scale: 0.99, transition: { duration: 0.15 } }}
              className="relative z-10"
            >
              <div
                className="profile-modal-card"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => openCloseDialog(false)}
                  className="profile-modal-cross"
                >
                  <GoX size={20} className="text-amber-800" />
                </button>

                <h2 className="text-xl font-semibold text-amber-950">
                  Change Password
                </h2>

                <div className="stack-4 gen-form-labels">
                  {/* Current Password */}
                  <fieldset className="stack-0">
                    <label htmlFor="current-password">Current Password</label>
                    <div className="relative">
                      <input
                        id="current-password"
                        type={showCurrent ? "text" : "password"}
                        className="gen-input-forms w-full pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="profile-password-eye"
                      >
                        {showCurrent ? (
                          <GoEyeClosed size={18} />
                        ) : (
                          <GoEye size={18} />
                        )}
                      </button>
                    </div>
                  </fieldset>

                  {/* New Password */}
                  <fieldset className="stack-0">
                    <label htmlFor="new-password">New Password</label>
                    <div className="relative">
                      <input
                        id="new-password"
                        type={showNew ? "text" : "password"}
                        className="gen-input-forms w-full pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="profile-password-eye"
                      >
                        {showNew ? (
                          <GoEyeClosed size={18} />
                        ) : (
                          <GoEye size={18} />
                        )}
                      </button>
                    </div>
                  </fieldset>

                  {/* Confirm New Password */}
                  <fieldset className="stack-0">
                    <label htmlFor="confirm-password">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        type={showConfirm ? "text" : "password"}
                        className="gen-input-forms w-full pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="profile-password-eye"
                      >
                        {showConfirm ? (
                          <GoEyeClosed size={18} />
                        ) : (
                          <GoEye size={18} />
                        )}
                      </button>
                    </div>
                  </fieldset>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => openCloseDialog(false)}
                    className="px-4 py-2 text-amber-800 rounded-md
            hover:bg-amber-200/68 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => openCloseDialog(false)}
                    className="px-5 py-2 bg-amber-600/94 text-white font-medium
            rounded-md shadow-md hover:bg-amber-700/94
            transition-colors cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}
