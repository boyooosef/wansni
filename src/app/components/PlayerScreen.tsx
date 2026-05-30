import { useState, useEffect } from 'react';
import { db, GameState } from '../App';
import { ref, set, push, onValue, get, remove } from 'firebase/database';
import { avatars } from '../data/questions';
import { Player, Round, SpinState } from '../types';
import { useSound } from '../hooks/useSound';
import Leaderboard from './Leaderboard';
import SpinWheel from './SpinWheel';
import RoundDisplay from './RoundDisplay';

interface Props {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export default function PlayerScreen({ gameState, setGameState }: Props) {
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('😎');
  const [hasJoined, setHasJoined] = useState(false);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [spinState, setSpinState] = useState<SpinState | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const { roomCode, playerId } = gameState;
  const { playSound } = useSound();

  // Listen to current round
  useEffect(() => {
    if (!hasJoined) return;

    const roundRef = ref(db, `rooms/${roomCode}/currentRound`);
    const unsubscribe = onValue(roundRef, (snapshot) => {
      const round = snapshot.val();
      setCurrentRound(round);
      setHasVoted(false); // Reset vote status when round changes
    });

    return () => unsubscribe();
  }, [roomCode, hasJoined]);

  // Listen to players
  useEffect(() => {
    if (!hasJoined) return;

    const playersRef = ref(db, `rooms/${roomCode}/players`);
    const unsubscribe = onValue(playersRef, (snapshot) => {
      setPlayers(snapshot.val() || {});
    });

    return () => unsubscribe();
  }, [roomCode, hasJoined]);

  // Listen to spin state
  useEffect(() => {
    if (!hasJoined) return;

    const spinRef = ref(db, `rooms/${roomCode}/spinState`);
    const unsubscribe = onValue(spinRef, (snapshot) => {
      setSpinState(snapshot.val());
    });

    return () => unsubscribe();
  }, [roomCode, hasJoined]);

  // Check if player was kicked
  useEffect(() => {
    if (!hasJoined || !playerId) return;

    const playerRef = ref(db, `rooms/${roomCode}/players/${playerId}`);
    const unsubscribe = onValue(playerRef, (snapshot) => {
      if (!snapshot.exists()) {
        alert("تم إخراجك من القعدة");
        window.location.reload();
      }
    });

    return () => unsubscribe();
  }, [roomCode, playerId, hasJoined]);

  // Check for game end
  useEffect(() => {
    if (!hasJoined) return;

    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const room = snapshot.val();
      if (!room) return;

      if (room.status === "finished" && room.winner) {
        alert(`الفائز: ${room.winner.name} بـ ${room.winner.points} نقطة!`);
      }

      if (room.status === "ended") {
        alert("انتهت اللعبة");
        window.location.reload();
      }
    });

    return () => unsubscribe();
  }, [roomCode, hasJoined]);

  const joinAsPlayer = async () => {
    const name = playerName.trim();
    if (name === "") {
      alert("اكتب اسمك 😅");
      return;
    }

    // Play join sound (very quiet to trigger audio context)
    playSound('vote', 0.01);

    const playerRef = push(ref(db, `rooms/${roomCode}/players`));
    const newPlayerId = playerRef.key!;

    await set(playerRef, {
      name: name,
      avatar: selectedAvatar,
      points: 0,
      admin: false,
      joinedAt: Date.now()
    });

    setGameState(prev => ({
      ...prev,
      playerId: newPlayerId,
      playerName: name
    }));

    setHasJoined(true);
  };

  const vote = async (result: 'success' | 'fail') => {
    const voteRef = ref(db, `rooms/${roomCode}/votes/${playerId}`);

    const existingVote = await get(voteRef);
    if (existingVote.exists()) {
      alert("صوتت بالفعل 😄");
      return;
    }

    if (!currentRound) {
      alert("لا توجد جولة حالياً");
      return;
    }

    if (currentRound.playerId === playerId) {
      alert("لا يمكنك تقييم نفسك 😅");
      return;
    }

    // Play vote sound
    playSound('vote');

    await set(voteRef, {
      playerName: gameState.playerName,
      vote: result
    });

    setHasVoted(true);
  };

  const leaveGame = async () => {
    if (!playerId) {
      window.location.reload();
      return;
    }

    await remove(ref(db, `rooms/${roomCode}/players/${playerId}`));
    window.location.reload();
  };

  if (!hasJoined) {
    return (
      <div className="mt-20 p-6 rounded-[28px] bg-[rgba(20,25,45,0.88)] backdrop-blur-md
                      shadow-[0_0_25px_rgba(124,58,237,0.25),0_0_60px_rgba(59,130,246,0.12)]
                      border border-white/[0.06]">
        <h1 className="text-[38px] font-bold text-white text-center">📱 دخول القعدة</h1>

        <input
          className="w-full p-4 mt-4 rounded-2xl text-lg border-none outline-none"
          placeholder="اكتب اسمك"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />

        <div className="mt-4 p-4 rounded-2xl bg-black/30">
          <h3 className="text-white font-bold text-center mb-3">اختر الأفاتار</h3>
          <div className="grid grid-cols-4 gap-2">
            {avatars.map((avatar) => (
              <button
                key={avatar}
                onClick={() => setSelectedAvatar(avatar)}
                className={`p-3 rounded-2xl text-3xl transition-all ${
                  selectedAvatar === avatar
                    ? 'bg-[#7c3aed] outline outline-3 outline-white scale-105'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={joinAsPlayer}
          className="w-full p-4 mt-4 rounded-2xl bg-[#10b981] text-white font-bold text-lg
                     hover:scale-105 transition-transform"
        >
          ➕ انضم للقعدة
        </button>
      </div>
    );
  }

  return (
    <div className="mt-20 p-6 rounded-[28px] bg-[rgba(20,25,45,0.88)] backdrop-blur-md
                    shadow-[0_0_25px_rgba(124,58,237,0.25),0_0_60px_rgba(59,130,246,0.12)]
                    border border-white/[0.06] min-h-[80vh] flex flex-col gap-4">
      <h2 className="text-xl text-white text-center">حياك الله يا {gameState.playerName}</h2>

      <div className="p-4 rounded-2xl bg-black/30">
        <h3 className="text-white font-bold mb-2">🎰 اختيار اللاعب</h3>
        {spinState ? (
          <SpinWheel spinState={spinState} isHostMode={false} />
        ) : (
          <div className="text-white/60 text-center py-4">بانتظار اختيار اللاعب...</div>
        )}
      </div>

      <div className="p-4 rounded-2xl bg-black/30">
        <h3 className="text-white font-bold mb-2">🏆 الترتيب المباشر</h3>
        <Leaderboard players={players} isHostMode={false} compact={true} />
      </div>

      <div className="p-4 rounded-2xl bg-black/30 flex-1">
        <h3 className="text-white font-bold mb-2">🔥 الجولة الحالية</h3>
        <RoundDisplay round={currentRound} elementId="player-round" isHostMode={false} />
      </div>

      {currentRound && currentRound.playerId !== playerId && !hasVoted && (
        <div className="flex gap-2">
          <button
            onClick={() => vote('success')}
            className="flex-1 p-3 rounded-2xl bg-[#10b981] text-white font-bold hover:scale-105 transition-transform"
          >
            ✅ نجح
          </button>
          <button
            onClick={() => vote('fail')}
            className="flex-1 p-3 rounded-2xl bg-[#ef4444] text-white font-bold hover:scale-105 transition-transform"
          >
            ❌ فشل
          </button>
        </div>
      )}

      {hasVoted && (
        <div className="p-3 rounded-2xl bg-green-900/50 text-green-300 text-center font-bold">
          ✅ تم تسجيل تصويتك
        </div>
      )}

      <button
        onClick={leaveGame}
        className="p-2 rounded-2xl bg-[#ef4444] text-white text-sm font-bold hover:scale-105 transition-transform"
      >
        🚪 خروج من اللعبة
      </button>
    </div>
  );
}
