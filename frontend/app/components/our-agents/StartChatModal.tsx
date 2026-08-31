import type { ModalProps } from "~/components/user-profile/modalTypes";
import type { PropertyData } from "@free-real-estate/shared";
import type { Agent } from "~/routes/our-agents";

import { useFetcher } from "react-router";
import { motion, AnimatePresence } from "motion/react";

import useObjectState from "~/hooks/useObjectState";
import createDialogCloseHandler from "~/utils/createDialogCloseHandler";
import getAssetUrl from "~/utils/getAssetUrl";

import { GoX } from "react-icons/go";

interface StartChatForm {
  propertyId: number;
}

// Every chat is about a property, so one has to be picked before the chat opens
export default function StartChatModal({
  startChatProps,
  agent,
  agentProperties,
}: {
  startChatProps: ModalProps;
  agent: Agent;
  agentProperties: PropertyData[];
}) {
  const { isDialogOpen, dialogRef, openCloseDialog } = startChatProps;

  const fetcher = useFetcher();

  const { state: startChatForm, updateState: updateStartChatForm } =
    useObjectState<StartChatForm>({ propertyId: 0 });

  const handleCloseDialog = createDialogCloseHandler<StartChatForm>(
    openCloseDialog,
    updateStartChatForm,
    { propertyId: 0 },
  );

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
              className="absolute inset-0 bg-black/46 backdrop-blur-[1px]"
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

                <h2 className="modal-title">Message {agent.name}</h2>

                <fetcher.Form method="POST" className="stack-4">
                  <input type="hidden" name="intent" value="start-chat" />
                  <input type="hidden" name="agentId" value={agent.id} />
                  <input
                    type="hidden"
                    name="propertyId"
                    value={startChatForm.propertyId}
                  />

                  {fetcher.data?.error ? (
                    <p className="mt-4 form-error">{fetcher.data.error}</p>
                  ) : (
                    <div className="mt-4 form-message-space" />
                  )}

                  {agentProperties.length ? (
                    <>
                      <p className="text-slate-700/72">
                        Conversations are tied to a property. Which one would
                        you like to ask about?
                      </p>

                      <ul className="max-h-[38vh] overflow-y-auto stack-2 pr-1">
                        {agentProperties.map((property) => {
                          const isSelected =
                            property.id === startChatForm.propertyId;

                          return (
                            <li key={`chat-property-${property.id}`}>
                              <button
                                type="button"
                                onClick={() =>
                                  updateStartChatForm({
                                    propertyId: property.id,
                                  })
                                }
                                aria-pressed={isSelected}
                                className={`w-full flex items-center gap-3 p-2 text-left
                                rounded-lg border transition-colors duration-150
                                ${
                                  isSelected
                                    ? "bg-amber-200/56 border-amber-300/72"
                                    : "bg-amber-100/28 border-amber-200/40 hover:bg-amber-100/64"
                                }`}
                              >
                                <img
                                  src={getAssetUrl(property.exteriorImage)}
                                  alt=""
                                  draggable={false}
                                  className="w-16 h-12 shrink-0 rounded-md object-cover shadow-sm"
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-amber-950 line-clamp-1">
                                    {property.title}
                                  </p>
                                  <p className="text-xs text-amber-800/72 line-clamp-1">
                                    {property.province}, {property.city}
                                  </p>
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  ) : (
                    <p className="py-6 text-sm text-center text-amber-800/94 italic">
                      Our agent has no listed properties to discuss about yet.
                    </p>
                  )}

                  <fieldset className="flex flex-row justify-end gap-4 mt-4">
                    <button
                      type="button"
                      onClick={handleCloseDialog}
                      className="modal-cancel-btn"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        !startChatForm.propertyId || fetcher.state !== "idle"
                      }
                      className="modal-accept-btn
                      disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {fetcher.state === "idle" ? "Start Chat" : "Opening..."}
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
