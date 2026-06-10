import { getAssetUrl } from "~/utils/display";

type AgentCardProps = {
  agent: {
    id: number;
    name: string;
    profilePicture: string;
  };
  onSelect: (id: number) => void;
};

export default function AgentCard({ agent, onSelect }: AgentCardProps) {
  return (
    <button
      onClick={() => onSelect(agent.id)}
      className="group stack-3 items-center w-full h-full max-lg:px-4 max-lg:py-6 p-6 rounded-xl
      bg-amber-100/28 hover:bg-amber-100/48 border border-amber-200/36
      shadow-md inset-shadow-sm hover:shadow-lg active:shadow-md
      gen-btn-hovaction-xs transition-all"
    >
      <div className="relative">
        <img
          src={getAssetUrl(agent.profilePicture)}
          alt={`${agent.name}'s profile picture`}
          draggable={false}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-md
          border-2 border-amber-50/82 outline-2 outline-amber-300/48
          group-hover:outline-amber-400/64 transition-all duration-300"
        />
        <div
          className="absolute inset-0 rounded-full
          bg-amber-400/0 group-hover:bg-amber-400/8 transition-colors duration-300"
        />
      </div>
      <p
        className="max-sm:text-sm font-semibold max-w-[15ch]
        text-amber-950 group-hover:text-amber-800 transition-colors duration-300"
      >
        {agent.name}
      </p>
    </button>
  );
}
