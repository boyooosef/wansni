import { Player } from '../types';

interface Props {
  players: Record<string, Player>;
  isHostMode: boolean;
  compact?: boolean;
}

export default function Leaderboard({ players, isHostMode, compact = false }: Props) {
  const sortedPlayers = Object.entries(players)
    .sort((a, b) => (b[1].points || 0) - (a[1].points || 0));

  const getMedal = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "🎖️";
  };

  return (
    <div className="p-4 rounded-2xl bg-black/30 mt-4">
      <h3
        className={`text-white font-bold text-center mb-3 ${
          isHostMode ? 'text-2xl' : ''
        }`}
      >
        🏆 لوحة الصدارة
      </h3>
      <div
        className={`space-y-2 ${
          compact ? 'max-h-[90px] overflow-y-auto text-sm' : ''
        } ${isHostMode ? 'text-xl' : ''}`}
      >
        {sortedPlayers.map(([id, player], index) => (
          <div
            key={id}
            className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/10"
          >
            <span className="text-white">
              {getMedal(index)} {player.avatar || "😎"} {player.name}
            </span>
            <span className="text-white font-bold">{player.points || 0} نقطة</span>
          </div>
        ))}
        {sortedPlayers.length === 0 && (
          <div className="text-white/60 text-center py-4">بانتظار اللاعبين...</div>
        )}
      </div>
    </div>
  );
}
