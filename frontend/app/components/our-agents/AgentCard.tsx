import getAssetUrl, { handleProfilePictureError } from "~/utils/getAssetUrl";

interface AgentCardProps {
  agent: {
    id: number;
    name: string;
    profilePicture: string;
  };
  onSelect: (id: number) => void;
}

export default function AgentCard({ agent, onSelect }: AgentCardProps) {
  return (
    <button
      onClick={() => onSelect(agent.id)}
      className="group stack-2 h-full w-full btn-hovaction-xs items-center rounded-xl border border-amber-200/36 bg-amber-100/28 p-6 shadow-md inset-shadow-sm transition-all hover:bg-amber-100/48 hover:shadow-lg active:shadow-md max-lg:px-4 max-lg:py-6"
    >
      <div className="relative">
        <img
          src={getAssetUrl(agent.profilePicture)}
          alt={`${agent.name}'s profile picture`}
          onError={handleProfilePictureError}
          draggable={false}
          className="h-20 w-20 rounded-full border-2 border-amber-50/84 object-cover shadow-md outline-2 outline-amber-300/48 transition-all duration-300 group-hover:outline-amber-400/64 sm:h-24 sm:w-24"
        />
        <div className="absolute inset-0 rounded-full bg-transparent transition-colors duration-450 group-hover:bg-amber-400/12" />
      </div>
      <p className="max-w-[15ch] font-semibold text-amber-950 transition-colors duration-300 group-hover:text-amber-800 max-sm:text-sm">
        {agent.name}
      </p>
    </button>
  );
}
