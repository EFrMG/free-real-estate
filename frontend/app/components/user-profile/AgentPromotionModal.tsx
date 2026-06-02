import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

import { motion, AnimatePresence } from "motion/react";

import type { ModalProps } from "./modalTypes";

import { GoX } from "react-icons/go";
import useObjectState from "~/hooks/useObjectState";
import { createDialogCloseHandler } from "~/utils/dialogs";

interface AgentPromotionForm {
  licenseNumber: string;
  agencyPassword: string;
}

export default function AgentPromotionModal({
  agentPromotionProps,
}: {
  agentPromotionProps: ModalProps;
}) {
  const { isDialogOpen, dialogRef, openCloseDialog } = agentPromotionProps;

  const [fetcherKey, setFetcherKey] = useState(() => crypto.randomUUID());
  const fetcher = useFetcher({ key: fetcherKey });

  const { state: agentPromotionForm, updateState: updateAgentPromotionForm } =
    useObjectState<AgentPromotionForm>({
      licenseNumber: "",
      agencyPassword: "",
    });

  const handleCloseDialog = createDialogCloseHandler<AgentPromotionForm>(
    openCloseDialog,
    updateAgentPromotionForm,
    {
      licenseNumber: "",
      agencyPassword: "",
    },
  );
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      setTimeout(() => {
        openCloseDialog(false);
        setFetcherKey(crypto.randomUUID());
      }, 3000);
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        handleCloseDialog(e);
        setFetcherKey(crypto.randomUUID());
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
              onClick={(e) => {
                handleCloseDialog(e);
                setFetcherKey(crypto.randomUUID());
              }}
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
                  onClick={(e) => {
                    handleCloseDialog(e);
                    setFetcherKey(crypto.randomUUID());
                  }}
                  className="profile-modal-cross"
                >
                  <GoX size={20} className="text-amber-800" />
                </button>

                <h2 className="profile-modal-title">Become an Agent User</h2>

                <fetcher.Form method="PUT" className="stack-4 gen-form-labels">
                  <input type="hidden" name="intent" value="agent-promotion" />

                  {fetcher.data?.error ? (
                    <p className="mt-4 gen-form-error">{fetcher.data.error}</p>
                  ) : fetcher.data?.success ? (
                    <p className="mt-4 gen-form-success">
                      You have been promoted successfully.
                    </p>
                  ) : (
                    <div className="mt-4 gen-form-message-space" />
                  )}

                  {/* Current Password */}
                  <fieldset className="stack-0">
                    <label htmlFor="license-number">License Number</label>
                    <input
                      id="license-number"
                      name="licenseNumber"
                      type="text"
                      className="gen-input-forms w-full"
                      placeholder="Your license number"
                      min={20}
                      value={agentPromotionForm.licenseNumber}
                      onChange={(e) =>
                        updateAgentPromotionForm({
                          licenseNumber: e.target.value,
                        })
                      }
                      required
                    />
                  </fieldset>
                  <fieldset className="stack-0">
                    <label htmlFor="agency-password">Agency Password</label>
                    <input
                      id="agency-password"
                      name="agencyPassword"
                      type="text"
                      className="gen-input-forms w-full"
                      placeholder="••••••••••••••••"
                      min={20}
                      value={agentPromotionForm.agencyPassword}
                      onChange={(e) =>
                        updateAgentPromotionForm({
                          agencyPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </fieldset>

                  <div>
                    <p className="text-sm text-slate-700/72">
                      This is only meant for prospective agents. <br /> Please,
                      do not interact with this form if you are a normal user.
                      Thank you.
                    </p>
                  </div>

                  <fieldset className="flex flex-row justify-end gap-4 mt-8">
                    <button
                      type="button"
                      onClick={(e) => {
                        handleCloseDialog(e);
                        setFetcherKey(crypto.randomUUID());
                      }}
                      className="profile-modal-cancel-btn"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="profile-modal-accept-btn">
                      Require Promotion
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
