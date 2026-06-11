import type { Agent } from "~/routes/our-agents";

import { motion, AnimatePresence } from "motion/react";
import { getAssetUrl } from "~/utils/display";

import { GoShieldCheck, GoQuote } from "react-icons/go";
import { LuPhone } from "react-icons/lu";

interface AgentDetailPanelProps {
  isLoading: boolean;
  agent: Agent | null;
  onDeselect: () => void;
}

export default function AgentDetailPanel({
  isLoading,
  agent,
  onDeselect,
}: AgentDetailPanelProps) {
  const panelKey = isLoading
    ? "loading"
    : agent
      ? `agent-${agent.id}`
      : "placeholder";

  return (
    <div
      className="md:sticky md:top-[7.5vh] px-4 pb-3 xs:px-6 xs:pt-4 xs:pb-5
      bg-amber-100/64 md:bg-amber-50/64 rounded-xl shadow-md
      border border-amber-200/40 grid"
    >
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
            <div className="pt-4 stack-4">
              <div className="flex flex-col items-center gap-4">
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-amber-200/60 rounded-full animate-pulse shadow-sm" />
                <div className="w-48 h-6 bg-amber-200/60 rounded-full animate-pulse mt-1" />
                <div className="w-16 h-5 bg-amber-200/40 rounded-full animate-pulse" />
              </div>

              <div
                className="space-y-4 mt-6
                [&>div]:flex [&>div]:items-start [&>div]:gap-[1ch]
                [&>div]:pb-4 [&>div:not(:last-of-type)]:border-b [&>div]:border-amber-200/64"
              >
                <div>
                  <div className="w-4 h-4 rounded-sm bg-amber-200/80 animate-pulse shrink-0 mt-0.5" />
                  <div className="stack-2 w-full">
                    <div className="w-20 h-3 bg-amber-200/60 rounded-full animate-pulse" />
                    <div className="w-32 h-4 bg-amber-200/40 rounded-full animate-pulse" />
                  </div>
                </div>

                <div>
                  <div className="w-4 h-4 rounded-sm bg-amber-200/80 animate-pulse shrink-0 mt-0.5" />
                  <div className="stack-2 w-full">
                    <div className="w-12 h-3 bg-amber-200/60 rounded-full animate-pulse" />
                    <div className="stack-2 w-full mt-1">
                      <div className="w-full h-3.5 bg-amber-200/40 rounded-full animate-pulse" />
                      <div className="w-[90%] h-3.5 bg-amber-200/40 rounded-full animate-pulse" />
                      <div className="w-[60%] h-3.5 bg-amber-200/40 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="w-4 h-4 rounded-sm bg-amber-200/80 animate-pulse shrink-0 mt-0.5" />
                  <div className="stack-2 w-full">
                    <div className="w-16 h-3 bg-amber-200/60 rounded-full animate-pulse" />
                    <div className="w-28 h-4 bg-amber-200/40 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="w-full mt-2 py-5 bg-amber-200/40 rounded-lg animate-pulse" />
            </div>
          ) : agent ? (
            <div className="pt-5 xs:pt-4 stack-6">
              <div className="stack-2 items-center">
                <motion.img
                  src={getAssetUrl(agent.profilePicture)}
                  alt={`${agent.name} profile`}
                  draggable={false}
                  initial={{ scale: 0.92 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 21,
                    delay: 0.3,
                  }}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover shadow-lg
                  border-3 border-amber-50/82 outline-2 outline-amber-300/58"
                />
                <h2 className="text-xl font-medium text-amber-950 tracking-tight">
                  {agent.name}
                </h2>
                <span
                  className="px-3 py-0.5 text-xs bg-amber-300/34 text-amber-900 font-medium
                rounded-full border border-amber-300/60 capitalize"
                >
                  Agent
                </span>
              </div>

              {agent.profile && (
                <div
                  className="space-y-4
                  [&>div]:flex [&>div]:items-start [&>div]:gap-[1ch]
                  [&>div]:pb-4 [&_div:not(:last-of-type)]:border-b [&_div]:border-amber-200/64"
                >
                  <div>
                    <GoShieldCheck
                      size={18}
                      color="var(--color-amber-600)"
                      className="shrink-0"
                    />
                    <div>
                      <p className="text-sm text-amber-800/64 font-medium uppercase tracking-wide">
                        License
                      </p>
                      <p className="text-sm text-amber-950">
                        {agent.profile.licenseNumber}
                      </p>
                    </div>
                  </div>

                  {agent.profile.bio && (
                    <div>
                      <GoQuote
                        size={18}
                        color="var(--color-amber-600)"
                        className="shrink-0"
                      />
                      <div>
                        <p className="text-sm text-amber-800/64 font-medium uppercase tracking-wide">
                          Bio
                        </p>
                        <p className="text-sm text-amber-950/84 leading-relaxed">
                          {agent.profile.bio}
                        </p>
                      </div>
                    </div>
                  )}

                  {agent.profile.phoneNumber && (
                    <div>
                      <LuPhone
                        size={18}
                        color="var(--color-amber-600)"
                        className="shrink-0 opacity-76"
                      />
                      <div>
                        <p className="text-sm text-amber-800/64 font-medium uppercase tracking-wide">
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

              <button
                onClick={onDeselect}
                className="group flex items-center justify-center gap-[1ch]
                w-full px-3 py-2.5 text-sm font-medium text-amber-800
                bg-amber-200/36 rounded-lg shadow-sm
                hover:bg-amber-200/60 active:bg-amber-300/42
                gen-btn-border gen-btn-hovaction-xs transition-all"
              >
                <span
                  className="inline-block text-base group-hover:translate-x-[-0.25ch]
                  group-active:translate-x-0 transition-transform duration-300"
                >
                  ←
                </span>{" "}
                <span>Back to all agents</span>
              </button>
            </div>
          ) : (
            <div className="stack-4 py-4 text-center">
              <div className="mx-auto w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-amber-200/48 border-2 border-dashed border-amber-400/48 flex items-center justify-center">
                <span className="text-4xl opacity-42">👤</span>
              </div>
              <div className="stack-2">
                <div className="mx-auto w-32 h-4 bg-amber-200/48 rounded-full" />
                <div className="mx-auto w-48 h-3 bg-amber-200/28 rounded-full" />
              </div>
              <p className="text-sm text-amber-800/74 italic px-2">
                Select an agent to view their profile and details.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
