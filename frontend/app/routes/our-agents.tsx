import type { Route } from "./+types/our-agents";
import type { PropertyData } from "~/data/generalData";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useFetcher } from "react-router";

import AgentCard from "~/components/our-agents/AgentCard";
import AgentDetailPanel from "~/components/our-agents/AgentDetailPanel";
import MiniPropertyCard from "~/components/user-profile/MiniPropertyCard";

interface AgentBasic {
  id: number;
  name: string;
  profilePicture: string;
  role: string;
}

interface AgentDetail extends AgentBasic {
  profile?: {
    userId: number;
    licenseNumber: string;
    phoneNumber?: string | null;
    bio?: string | null;
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Our Agents | Free Real Estate" },
    {
      name: "description",
      content:
        "Meet the expert agents at Free Real Estate. Browse profiles, view listings, and contact the right professional.",
    },
  ];
}

export async function loader() {
  const agentsRes = await fetch("http://localhost:3000/api/users");

  if (!agentsRes.ok) {
    throw new Response("Failed to fetch agents", { status: 500 });
  }

  const agents: AgentBasic[] = await agentsRes.json();
  return { agents };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const id = formData.get("agentId");

  if (!id) {
    return { agentDetail: null, agentProperties: [] };
  }

  const [detailRes, propertiesRes] = await Promise.all([
    fetch(`http://localhost:3000/api/users/${id}`),
    fetch(`http://localhost:3000/api/users/${id}/properties`),
  ]);

  const detail: AgentDetail | null = detailRes.ok
    ? await detailRes.json()
    : null;

  const props: PropertyData[] = propertiesRes.ok
    ? await propertiesRes.json()
    : [];

  return { agentDetail: detail, agentProperties: props };
}

export default function OurAgents({ loaderData }: Route.ComponentProps) {
  const { agents } = loaderData;
  const fetcher = useFetcher<typeof action>();

  const [view, setView] = useState<"grid" | "detail">("grid");

  // agentId check is necessary to ensure that no skeleton is shown when handleDeselect runs
  const isLoading =
    fetcher.state !== "idle" && Boolean(fetcher.formData?.get("agentId"));
  const agentDetail = fetcher.data?.agentDetail || null;
  const agentProperties = fetcher.data?.agentProperties || [];

  // Stores the id of the next agent to load, queued while exit plays
  const pendingAgentId = useRef<number | null>(null);

  const loadAgent = (id: number) => {
    fetcher.submit({ agentId: id.toString() }, { method: "post" });
  };

  const handleSelectAgent = (id: number) => {
    if (id === agentDetail?.id && view === "detail") return;

    pendingAgentId.current = id;

    if (view === "grid") {
      setView("detail");
    } else {
      // Already in detail view; load new agent data directly
      loadAgent(id);
    }
  };

  const handleGridExitComplete = () => {
    if (pendingAgentId.current !== null) {
      loadAgent(pendingAgentId.current);
      pendingAgentId.current = null;
    }
  };

  const handleDeselect = () => {
    setView("grid");
    fetcher.submit({}, { method: "post" });
  };

  return (
    <main className="gen-main">
      {/* Left column */}
      <div className="max-md:order-1 gen-left-column">
        <hgroup>
          <h1 className="mt-10 sm:mt-8 md:mt-6 mb-2 text-2xl text-amber-950">
            Meet Our Agents
          </h1>
          <p className="text-amber-800/84 tracking-wide">
            Our experienced team is ready to guide you through every step of
            your real estate journey. Click on an agent to learn more.
          </p>
        </hgroup>
        <AnimatePresence mode="wait" onExitComplete={handleGridExitComplete}>
          {view === "grid" ? (
            <motion.div
              key="agents-grid"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6"
            >
              {agents.map((agent: AgentBasic) => (
                <AgentCard
                  key={`agent-wrapper-${agent.id}`}
                  agent={agent}
                  onSelect={handleSelectAgent}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="agent-properties"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <h2 className="mb-2 text-xl text-amber-950 tracking-tight">
                {agentDetail?.name
                  ? `${agentDetail.name}'s Listings`
                  : "Agent Listings"}
              </h2>
              <p className="mb-6 text-amber-800/74">
                Properties managed by this agent.
              </p>

              {isLoading ? (
                <div className="profile-bookmarks--properties">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="h-36 rounded-lg bg-amber-200/28 animate-pulse"
                    />
                  ))}
                </div>
              ) : agentProperties.length ? (
                <div className="profile-bookmarks--properties">
                  {agentProperties.map((property) => (
                    <motion.div
                      key={`agent-property-${property.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.5,
                        ease: "easeOut",
                      }}
                    >
                      <MiniPropertyCard
                        property={property}
                        clearBackground={false}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
                  className="py-12 text-center rounded-xl bg-amber-100/28 border border-dashed border-amber-300/48"
                >
                  <span className="text-3xl opacity-42 block mb-3">🏠</span>
                  <p className="inline-block text-sm text-amber-800/94 italic">
                    This agent doesn't have any listed properties yet.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right column */}
      <div className="max-md:order-0 md:bg-amber-100 max-md:mt-4 md:p-6">
        <AgentDetailPanel
          agent={agentDetail}
          isLoading={isLoading}
          onDeselect={handleDeselect}
        />
      </div>
    </main>
  );
}
