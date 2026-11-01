import type { Agent } from "~/routes/our-agents";

import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import getAssetUrl, { handleProfilePictureError } from "~/utils/getAssetUrl";

import { GoShieldCheck, GoQuote, GoComment } from "react-icons/go";
import { LuPhone } from "react-icons/lu";

interface AgentDetailPanelProps {
  isLoading: boolean;
  agent: Agent | null;
  onDeselect: () => void;
  onStartChat: () => void;
  currentUserId: number | null;
}

export default function AgentDetailPanel({
  isLoading,
  agent,
  onDeselect,
  onStartChat,
  currentUserId,
}: AgentDetailPanelProps) {
  const panelKey = isLoading
    ? "loading"
    : agent
      ? `agent-${agent.id}`
      : "placeholder";

  return (
    <div className="grid rounded-xl border border-amber-200/40 bg-amber-100/64 px-4 pb-3 shadow-md xs:px-6 xs:pt-4 xs:pb-5 md:sticky md:top-[7.5vh] md:bg-amber-50/64">
      <AnimatePresence>
        <motion.div
          key={panelKey}
          className="col-start-1 row-start-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {isLoading ? (
            <div className="stack-4 pt-4">
              <div className="flex flex-col items-center gap-4">
                <div className="h-28 w-28 animate-pulse rounded-full bg-amber-200/60 shadow-sm sm:h-32 sm:w-32" />
                <div className="mt-1 h-6 w-48 animate-pulse rounded-full bg-amber-200/60" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-amber-200/40" />
              </div>

              <div className="mt-6 space-y-4 [&>div]:flex [&>div]:items-start [&>div]:gap-[1ch] [&>div]:border-amber-200/64 [&>div]:pb-4 [&>div:not(:last-of-type)]:border-b">
                <div>
                  <div className="mt-0.5 h-4 w-4 shrink-0 animate-pulse rounded-sm bg-amber-200/84" />
                  <div className="stack-2 w-full">
                    <div className="h-3 w-20 animate-pulse rounded-full bg-amber-200/60" />
                    <div className="h-4 w-32 animate-pulse rounded-full bg-amber-200/40" />
                  </div>
                </div>

                <div>
                  <div className="mt-0.5 h-4 w-4 shrink-0 animate-pulse rounded-sm bg-amber-200/84" />
                  <div className="stack-2 w-full">
                    <div className="h-3 w-12 animate-pulse rounded-full bg-amber-200/60" />
                    <div className="mt-1 stack-2 w-full">
                      <div className="h-3.5 w-full animate-pulse rounded-full bg-amber-200/40" />
                      <div className="h-3.5 w-[90%] animate-pulse rounded-full bg-amber-200/40" />
                      <div className="h-3.5 w-[60%] animate-pulse rounded-full bg-amber-200/40" />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mt-0.5 h-4 w-4 shrink-0 animate-pulse rounded-sm bg-amber-200/84" />
                  <div className="stack-2 w-full">
                    <div className="h-3 w-16 animate-pulse rounded-full bg-amber-200/60" />
                    <div className="h-4 w-28 animate-pulse rounded-full bg-amber-200/40" />
                  </div>
                </div>
              </div>

              <div className="mt-2 w-full animate-pulse rounded-lg bg-amber-200/40 py-5" />
            </div>
          ) : agent ? (
            <div className="stack-6 pt-5 xs:pt-4">
              <div className="stack-2 items-center">
                <motion.img
                  src={getAssetUrl(agent.profilePicture)}
                  alt={`${agent.name} profile`}
                  onError={handleProfilePictureError}
                  draggable={false}
                  initial={{ scale: 0.92 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 21,
                    delay: 0.3,
                  }}
                  className="h-28 w-28 rounded-full border-3 border-amber-50/84 object-cover shadow-lg outline-2 outline-amber-300/60 sm:h-32 sm:w-32"
                />
                <h2 className="text-xl font-medium tracking-tight text-amber-950">
                  {agent.name}
                </h2>
                <span className="rounded-full border border-amber-300/60 bg-amber-300/36 px-3 py-0.5 text-xs font-medium text-amber-900 capitalize">
                  Agent
                </span>
              </div>

              {agent.profile && (
                <div className="space-y-4 [&_div]:border-amber-200/64 [&_div:not(:last-of-type)]:border-b [&>div]:flex [&>div]:items-start [&>div]:gap-[1ch] [&>div]:pb-4">
                  <div>
                    <GoShieldCheck
                      size={18}
                      color="var(--color-amber-600)"
                      className="shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium tracking-wide text-amber-800/64 uppercase">
                        License
                      </p>
                      <p className="text-sm text-amber-950">
                        {agent.profile.licenseNumber}
                      </p>
                    </div>
                  </div>

                  {agent.profile.biography && (
                    <div>
                      <GoQuote
                        size={18}
                        color="var(--color-amber-600)"
                        className="shrink-0"
                      />
                      <div>
                        <p className="text-sm font-medium tracking-wide text-amber-800/64 uppercase">
                          Biography
                        </p>
                        <p className="text-sm leading-relaxed text-amber-950/84">
                          {agent.profile.biography}
                        </p>
                      </div>
                    </div>
                  )}

                  {agent.profile.phoneNumber && (
                    <div>
                      <LuPhone
                        size={18}
                        color="var(--color-amber-600)"
                        className="shrink-0 opacity-74"
                      />
                      <div>
                        <p className="text-sm font-medium tracking-wide text-amber-800/64 uppercase">
                          Phone
                        </p>
                        <p className="text-sm text-amber-950">
                          {agent.profile.phoneNumber}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentUserId === null ? (
                <Link
                  to="/log-in"
                  className="panel-action group min-h-12 bg-amber-600/94 text-amber-50 hover:bg-amber-700/94"
                >
                  <GoComment size={18} />
                  <span>Log in to message</span>
                </Link>
              ) : (
                currentUserId !== agent.id && (
                  <button
                    onClick={onStartChat}
                    className="panel-action group min-h-12 bg-amber-600/94 text-amber-50 hover:bg-amber-700/94 active:bg-amber-800/94"
                  >
                    <GoComment size={18} />
                    <span>Message our agent</span>
                  </button>
                )
              )}

              <button
                onClick={onDeselect}
                className="panel-action group min-h-12 bg-amber-200/36 text-amber-800 hover:bg-amber-200/60 active:bg-amber-300/40"
              >
                <span className="inline-block text-base transition-transform duration-300 group-hover:translate-x-[-0.25ch] group-active:translate-x-0">
                  ←
                </span>{" "}
                <span>Back to all agents</span>
              </button>
            </div>
          ) : (
            <div className="stack-4 pt-4 text-center">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-amber-400/48 bg-amber-200/48 sm:h-32 sm:w-32">
                <span className="text-4xl opacity-40">👤</span>
              </div>
              <div className="stack-2">
                <div className="mx-auto h-4 w-32 rounded-full bg-amber-200/48" />
                <div className="mx-auto h-3 w-48 rounded-full bg-amber-200/28" />
              </div>
              <p className="px-2 text-amber-800/74 italic">
                Select an agent to view their profile and details.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
