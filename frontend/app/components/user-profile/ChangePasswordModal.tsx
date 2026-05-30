import { motion, AnimatePresence } from "motion/react";

import type { ModalProps } from "./modalTypes";

import { GoEye, GoEyeClosed, GoX } from "react-icons/go";
import useObjectState from "~/hooks/useObjectState";
import { createDialogCloseHandler } from "~/utils/dialogs";

interface PasswordForm {
  currentPassword: string;
  showCurrent: boolean;
  newPassword: string;
  showNew: boolean;
  confirmPassword: string;
  showConfirm: boolean;
  errorMessage: string;
  successMessage: string;
}

export default function ChangePasswordModal({
  changePasswordProps,
  userId,
}: {
  changePasswordProps: ModalProps;
  userId: number;
}) {
  const { isDialogOpen, dialogRef, openCloseDialog } = changePasswordProps;

  const { state: passwordForm, updateState: updatePasswordForm } =
    useObjectState<PasswordForm>({
      currentPassword: "",
      showCurrent: false,
      newPassword: "",
      showNew: false,
      confirmPassword: "",
      showConfirm: false,
      errorMessage: "",
      successMessage: "",
    });

  const handleCloseDialog = createDialogCloseHandler(
    openCloseDialog,
    updatePasswordForm,
    {
      currentPassword: "",
      showCurrent: false,
      newPassword: "",
      showNew: false,
      confirmPassword: "",
      showConfirm: false,
      errorMessage: "",
      successMessage: "",
    },
  );

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    updatePasswordForm({ errorMessage: "", successMessage: "" });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      updatePasswordForm({ errorMessage: "New passwords must match!" });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${userId}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          }),
          credentials: "include",
        },
      );

      const data = await response.json();

      if (response.ok) {
        updatePasswordForm({
          successMessage: "Password updated successfully.",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setTimeout(() => {
          openCloseDialog(false);
          updatePasswordForm({ successMessage: "" });
        }, 3000);
      } else {
        updatePasswordForm({
          errorMessage: data.error || "Failed to update password.",
        });
      }
    } catch (err) {
      updatePasswordForm({
        errorMessage: "An error occurred. Please try again.",
      });
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        handleCloseDialog(e);
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
              onClick={(e) => handleCloseDialog(e)}
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
                  onClick={(e) => handleCloseDialog(e)}
                  className="profile-modal-cross"
                >
                  <GoX size={20} className="text-amber-800" />
                </button>

                <h2 className="profile-modal-title">Change Password</h2>

                <form
                  className="stack-4 gen-form-labels"
                  onSubmit={handleSubmit}
                >
                  {passwordForm.errorMessage ? (
                    <p className="mt-4 gen-form-error">
                      {passwordForm.errorMessage}
                    </p>
                  ) : passwordForm.successMessage ? (
                    <p className="mt-4 gen-form-success">
                      {passwordForm.successMessage}
                    </p>
                  ) : (
                    <div className="mt-4 gen-form-message-space" />
                  )}

                  {/* Current Password */}
                  <fieldset className="stack-0">
                    <label htmlFor="current-password">Current Password</label>
                    <div className="relative">
                      <input
                        id="current-password"
                        type={passwordForm.showCurrent ? "text" : "password"}
                        className="gen-input-forms w-full pr-10"
                        placeholder="••••••••"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          updatePasswordForm({
                            currentPassword: e.target.value,
                          })
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updatePasswordForm({
                            showCurrent: !passwordForm.showCurrent,
                          })
                        }
                        className="profile-modal-password-eye"
                      >
                        {passwordForm.showCurrent ? (
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
                        type={passwordForm.showNew ? "text" : "password"}
                        className="gen-input-forms w-full pr-10"
                        placeholder="••••••••"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          updatePasswordForm({ newPassword: e.target.value })
                        }
                        minLength={8}
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updatePasswordForm({ showNew: !passwordForm.showNew })
                        }
                        className="profile-modal-password-eye"
                      >
                        {passwordForm.showNew ? (
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
                        type={passwordForm.showConfirm ? "text" : "password"}
                        className="gen-input-forms w-full pr-10"
                        placeholder="••••••••"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          updatePasswordForm({
                            confirmPassword: e.target.value,
                          })
                        }
                        minLength={8}
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updatePasswordForm({
                            showConfirm: !passwordForm.showConfirm,
                          })
                        }
                        className="profile-modal-password-eye"
                      >
                        {passwordForm.showConfirm ? (
                          <GoEyeClosed size={18} />
                        ) : (
                          <GoEye size={18} />
                        )}
                      </button>
                    </div>
                  </fieldset>
                  <fieldset className="flex flex-row justify-end gap-4 mt-8">
                    <button
                      type="button"
                      onClick={(e) => handleCloseDialog(e)}
                      className="profile-modal-cancel-btn"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="profile-modal-accept-btn">
                      Update Password
                    </button>
                  </fieldset>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}
