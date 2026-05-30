import { Player } from '../types';

interface Props {
  players: Record<string, Player>;
  onKickPlayer: (id: string) => void;
}

export default function PlayersList({ players, onKickPlayer }: Props) {
  return (
    <div className="p-4 rounded-2xl bg-black/30 mt-4">
      <h3 className="text-white font-bold text-center mb-3">👥 اللي بالقعدة</h3>
      <div className="space-y-2">
        {Object.entries(players).map(([id, player]) => (
          <div
            key={id}
            className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/10"
          >
            <span className="text-white">
              {player.avatar || "😎"} {player.admin ? "👑 " : ""}{player.name}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-white">🏆 {player.points || 0}</span>
              <button
                onClick={() => onKickPlayer(id)}
                className="px-3 py-1 rounded-lg bg-[#ef4444] text-white text-sm font-bold hover:bg-red-600"
              >
                طرد
              </button>
            </div>
          </div>
        ))}
        {Object.keys(players).length === 0 && (
          <div className="text-white/60 text-center py-4">بانتظار اللاعبين...</div>
        )}
      </div>
    </div>
  );
}
