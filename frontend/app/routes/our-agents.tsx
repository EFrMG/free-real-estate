import type { Route } from "./+types/our-agents";
import type { PropertyData } from "~/data/generalData";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useFetcher, useRouteLoaderData, redirect } from "react-router";

import useDialog from "~/hooks/useDialog";
import forwardCookies from "~/utils/forwardCookies";
import { getAuth } from "~/utils/auth";
import { API_URL } from "~/utils/apiUrl";
import { mergeMeta } from "~/utils/meta";

import AgentCard from "~/components/our-agents/AgentCard";
import AgentDetailPanel from "~/components/our-agents/AgentDetailPanel";
import StartChatModal from "~/components/our-agents/StartChatModal";
import MiniPropertyCard from "~/components/user-profile/MiniPropertyCard";

interface AgentBasic {
  id: number;
  name: string;
  profilePicture: string;
  role: string;
}

export interface Agent extends AgentBasic {
  profile?: {
    userId: number;
    licenseNumber: string;
    phoneNumber?: string | null;
    biography?: string | null;
  };
}

export function meta({ matches }: Route.MetaArgs) {
  return mergeMeta(matches, {
    title: "Our Agents | Free Real Estate",
    description:
      "Meet the expert agents at Free Real Estate. Browse profiles, view listings, and contact the right professional.",
  });
}

export async function loader() {
  const agentsRes = await fetch(API_URL + "/api/users");

  if (!agentsRes.ok) {
    throw new Response("Failed to fetch agents", { status: 500 });
  }

  const agents: AgentBasic[] = await agentsRes.json();
  return { agents };
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();

  // Opening a chat hands the user over to their profile, where the panel lives
  if (formData.get("intent") === "start-chat") {
    // Shared /auth/me call; authMiddleware forwards any rotation it caused
    const { user, cookie } = await getAuth(context);

    // We need an actual user to send messages
    if (!user) return redirect("/log-in");

    const chatRes = await fetch(API_URL + "/api/chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        agentId: Number(formData.get("agentId")),
        propertyId: Number(formData.get("propertyId")),
      }),
    });

    if (!chatRes.ok) {
      return { error: "We could not open that conversation." };
    }

    const { chatId } = await chatRes.json();

    return redirect(`/user-profile/${user.id}?chat=${chatId}`, {
      headers: forwardCookies(chatRes),
    });
  }

  const id = formData.get("agentId");

  if (!id) {
    return { agentDetail: null, agentProperties: [] };
  }

  const [profileRes, propertiesRes] = await Promise.all([
    fetch(`${API_URL}/api/users/${id}`),
    fetch(`${API_URL}/api/users/${id}/properties`),
  ]);

  const profile: Agent | null = profileRes.ok ? await profileRes.json() : null;

  const properties: PropertyData[] = propertiesRes.ok
    ? await propertiesRes.json()
    : [];

  return { agent: profile, agentProperties: properties };
}

export default function OurAgents({ loaderData }: Route.ComponentProps) {
  const { agents } = loaderData;

  const rootData = useRouteLoaderData("root");
  const currentUserId: number | null = rootData?.user?.id ?? null;

  const {
    isDialogOpen: isStartChatOpen,
    dialogRef: startChatRef,
    openCloseDialog: setStartChatOpen,
  } = useDialog();

  const fetcher = useFetcher<typeof action>();
  // agentId check is necessary so no skeleton shows when handleDeselect runs
  const isLoading =
    fetcher.state !== "idle" && Boolean(fetcher.formData?.get("agentId"));
  const agent = fetcher.data?.agent || null;
  const agentProperties = fetcher.data?.agentProperties || [];

  const [view, setView] = useState<"grid" | "detail">("grid");

  // Stores the id of the next agent to load, queued while exit plays
  const pendingAgentId = useRef<number | null>(null);

  const loadAgent = (id: number) => {
    fetcher.submit({ agentId: id.toString() }, { method: "post" });
  };

  const handleSelectAgent = (id: number) => {
    if (id === agent?.id && view === "detail") return;

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
    <>
      <main className="gen-main">
        {/* Left column */}
        <div className="gen-left-column max-md:order-1">
          <hgroup>
            <h1 className="page-title mt-10 mb-2 sm:mt-8 md:mt-6">
              Meet Our Agents
            </h1>
            <p className="tracking-wide text-amber-800/84">
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
                className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6"
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
                <h2 className="mb-2 text-xl tracking-tight text-amber-950">
                  {agent?.name ? `${agent.name}'s Listings` : "Agent Listings"}
                </h2>
                <p className="mb-6 text-amber-800/74">
                  Properties managed by the agent.
                </p>

                {isLoading ? (
                  <div className="profile-bookmarks--properties">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={`skeleton-${i}`}
                        className="h-36 animate-pulse rounded-lg bg-amber-200/28"
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
                    className="mx-auto w-fit rounded-xl border border-dashed border-amber-300/60 bg-amber-100/28 px-6 py-12 text-center"
                  >
                    <span className="mb-4 block text-3xl opacity-40 select-none">
                      🏠
                    </span>
                    <p className="inline-block text-amber-800/74 italic">
                      This agent doesn't have any listed properties yet.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right column */}
        <div className="max-md:order-0 md:bg-amber-100 md:p-6">
          <AgentDetailPanel
            isLoading={isLoading}
            agent={agent}
            onDeselect={handleDeselect}
            onStartChat={() => setStartChatOpen(true)}
            currentUserId={currentUserId}
          />
        </div>
      </main>

      {/* Modals */}
      {agent && (
        <StartChatModal
          startChatProps={{
            isDialogOpen: isStartChatOpen,
            dialogRef: startChatRef,
            openCloseDialog: setStartChatOpen,
          }}
          agent={agent}
          agentProperties={agentProperties}
        />
      )}
    </>
  );
}
