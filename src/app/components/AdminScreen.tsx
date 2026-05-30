import { useState, useEffect } from 'react';
import { db, GameState } from '../App';
import { ref, set, push, onValue, update, get, remove } from 'firebase/database';
import { categories } from '../data/questions';
import { Player, Round, SpinState, Room } from '../types';
import { useSound } from '../hooks/useSound';
import QRCodeGenerator from './QRCodeGenerator';
import CategorySelector from './CategorySelector';
import PlayersList from './PlayersList';
import Leaderboard from './Leaderboard';
import SpinWheel from './SpinWheel';
import RoundDisplay from './RoundDisplay';
import VotingPanel from './VotingPanel';

interface Props {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export default function AdminScreen({ gameState, setGameState }: Props) {
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [selectedCategory, setSelectedCategory] = useState('kuwait');
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [votes, setVotes] = useState<Record<string, any>>({});
  const [spinState, setSpinState] = useState<SpinState | null>(null);
  const [selectedNextPlayer, setSelectedNextPlayer] = useState<string | null>(null);
  const [isHostMode, setIsHostMode] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);

  const { roomCode, playerId } = gameState;
  const { playSound } = useSound();

  // Listen to room data
  useEffect(() => {
    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoom(data);
        setSelectedCategory(data.selectedCategory || 'kuwait');

        if (data.status === 'finished' && data.winner) {
          showWinnerScreen(data.winner);
        }
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

  // Listen to players
  useEffect(() => {
    const playersRef = ref(db, `rooms/${roomCode}/players`);
    const unsubscribe = onValue(playersRef, (snapshot) => {
      setPlayers(snapshot.val() || {});
    });

    return () => unsubscribe();
  }, [roomCode]);

  // Listen to current round
  useEffect(() => {
    const roundRef = ref(db, `rooms/${roomCode}/currentRound`);
    const unsubscribe = onValue(roundRef, (snapshot) => {
      setCurrentRound(snapshot.val());
    });

    return () => unsubscribe();
  }, [roomCode]);

  // Listen to votes
  useEffect(() => {
    const votesRef = ref(db, `rooms/${roomCode}/votes`);
    const unsubscribe = onValue(votesRef, (snapshot) => {
      setVotes(snapshot.val() || {});
    });

    return () => unsubscribe();
  }, [roomCode]);

  // Listen to spin state
  useEffect(() => {
    const spinRef = ref(db, `rooms/${roomCode}/spinState`);
    const unsubscribe = onValue(spinRef, (snapshot) => {
      setSpinState(snapshot.val());
    });

    return () => unsubscribe();
  }, [roomCode]);

  const randomPlayerShow = async () => {
    const ids = Object.keys(players);
    if (ids.length === 0) {
      alert("لا يوجد لاعبين");
      return;
    }

    let counter = 0;
    const totalSpins = 35;

    // Play spin sound
    playSound('spin', 0.4);

    await set(ref(db, `rooms/${roomCode}/spinState`), {
      active: true,
      startedAt: Date.now(),
      playersCount: ids.length
    });

    const spin = setInterval(async () => {
      const randomId = ids[Math.floor(Math.random() * ids.length)];
      const p = players[randomId];

      await update(ref(db, `rooms/${roomCode}/spinState`), {
        currentName: p.name,
        currentAvatar: p.avatar || "😎",
        counter: counter
      });

      counter++;

      if (counter >= totalSpins) {
        clearInterval(spin);

        const finalId = ids[Math.floor(Math.random() * ids.length)];
        const finalPlayer = players[finalId];

        setSelectedNextPlayer(finalId);

        await update(ref(db, `rooms/${roomCode}/spinState`), {
          active: false,
          selectedPlayerId: finalId,
          currentName: finalPlayer.name,
          currentAvatar: finalPlayer.avatar || "😎",
          finishedAt: Date.now()
        });
      }
    }, 90);
  };

  const startRound = async () => {
    if (!room) return;

    const categoryKey = room.selectedCategory || selectedCategory;

    if (!categoryKey || !categories[categoryKey]) {
      alert("اختر القسم أولاً قبل بدء الجولة");
      return;
    }

    const category = categories[categoryKey];
    if (!category.questions || category.questions.length === 0) {
      alert("هذا القسم لا يحتوي على أسئلة");
      return;
    }

    const ids = Object.keys(players);
    if (ids.length < 1) {
      alert("لازم لاعب واحد على الأقل");
      return;
    }

    const randomId = selectedNextPlayer || ids[Math.floor(Math.random() * ids.length)];
    setSelectedNextPlayer(null);
    const randomPlayer = players[randomId];

    const used = room.usedQuestions?.[categoryKey] || {};
    let available = category.questions
      .map((q, index) => ({ ...q, index }))
      .filter(q => !used[q.index]);

    if (available.length === 0) {
      await set(ref(db, `rooms/${roomCode}/usedQuestions/${categoryKey}`), {});
      available = category.questions.map((q, index) => ({ ...q, index }));
    }

    const question = available[Math.floor(Math.random() * available.length)];

    await set(ref(db, `rooms/${roomCode}/votes`), null);

    await update(ref(db, `rooms/${roomCode}/usedQuestions/${categoryKey}`), {
      [question.index]: true
    });

    await set(ref(db, `rooms/${roomCode}/currentRound`), {
      playerId: randomId,
      playerName: randomPlayer.name,
      categoryKey: categoryKey,
      categoryName: category.name,
      question: question.q || question.question,
      answer: question.a || question.answer || "لا توجد إجابة محددة",
      points: question.points || 10,
      prepSeconds: 5,
      answerSeconds: category.time,
      startedAt: Date.now(),
      phase: "prep",
      answerRevealed: false
    });
  };

  const revealAnswerEarly = async () => {
    if (!currentRound) {
      alert("ماكو جولة حالياً");
      return;
    }

    await update(ref(db, `rooms/${roomCode}/currentRound`), {
      answerRevealed: true
    });
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

    // Play vote sound
    playSound('vote');

    await set(voteRef, {
      playerName: gameState.playerName,
      vote: result
    });
  };

  const finishVoting = async () => {
    if (!currentRound) {
      alert("ماكو جولة حالياً");
      return;
    }

    let success = 0;
    let fail = 0;

    Object.values(votes).forEach((v: any) => {
      if (v.vote === "success") success++;
      if (v.vote === "fail") fail++;
    });

    const pointsChange = success >= fail ? currentRound.points : -5;

    // Play success or fail sound
    if (success >= fail) {
      playSound('correct', 0.8);
    } else {
      playSound('wrong', 0.8);
    }

    const playerPath = `rooms/${roomCode}/players/${currentRound.playerId}`;
    const playerSnap = await get(ref(db, playerPath));
    const player = playerSnap.val();

    if (!player) {
      alert("اللاعب غير موجود");
      return;
    }

    const newPoints = (player.points || 0) + pointsChange;

    await update(ref(db, playerPath), {
      points: newPoints
    });

    const winScore = room?.winScore || 70;

    if (newPoints >= winScore) {
      // Play winner sound
      playSound('winner', 1);

      await update(ref(db, `rooms/${roomCode}`), {
        status: "finished",
        winner: {
          name: player.name,
          avatar: player.avatar || "😎",
          points: newPoints
        }
      });

      await update(ref(db, `rooms/${roomCode}/currentRound`), {
        phase: "finished"
      });
      await set(ref(db, `rooms/${roomCode}/currentRound`), null);

      return;
    }

    await set(ref(db, `rooms/${roomCode}/lastResult`), {
      playerName: currentRound.playerName,
      pointsChange: pointsChange,
      success: success,
      fail: fail,
      message: pointsChange > 0
        ? `✅ نجح ${currentRound.playerName} وحصل على ${pointsChange} نقطة`
        : `❌ فشل ${currentRound.playerName} وخسر 5 نقاط`,
      createdAt: Date.now()
    });

    await update(ref(db, `rooms/${roomCode}/currentRound`), {
      phase: "finished"
    });
    await set(ref(db, `rooms/${roomCode}/currentRound`), null);
    await set(ref(db, `rooms/${roomCode}/votes`), null);
  };

  const kickPlayer = async (id: string) => {
    if (!confirm("هل تريد طرد هذا اللاعب؟")) return;
    await remove(ref(db, `rooms/${roomCode}/players/${id}`));
  };

  const endGame = async () => {
    if (!confirm("هل تريد إنهاء اللعبة؟")) return;

    await update(ref(db, `rooms/${roomCode}`), {
      status: "ended",
      currentRound: null,
      spinState: null,
      votes: null
    });

    alert("تم إنهاء اللعبة");
    window.location.reload();
  };

  const toggleHostMode = () => {
    setIsHostMode(!isHostMode);
    if (!isHostMode) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const showWinnerScreen = (winner: any) => {
    // This would show winner screen - for now just alert
    alert(`الفائز: ${winner.name} بـ ${winner.points} نقطة!`);
  };

  const handleCategoryChange = async (key: string) => {
    await update(ref(db, `rooms/${roomCode}`), {
      selectedCategory: key
    });
  };

  return (
    <div className={`mt-20 ${isHostMode ? 'max-w-[1400px]' : ''}`}>
      <div className={`p-6 rounded-[28px] bg-[rgba(20,25,45,0.88)] backdrop-blur-md
                      shadow-[0_0_25px_rgba(124,58,237,0.25),0_0_60px_rgba(59,130,246,0.12)]
                      border border-white/[0.06]`}>
        <h1 className="text-[38px] font-bold text-white text-center">👑 لوحة الأدمن</h1>

        <QRCodeGenerator roomCode={roomCode} isHostMode={isHostMode} />

        {!isHostMode && (
          <>
            <CategorySelector
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />

            <PlayersList players={players} onKickPlayer={kickPlayer} />
          </>
        )}

        <Leaderboard players={players} isHostMode={isHostMode} />

        <button
          onClick={toggleHostMode}
          className="w-full p-4 mt-4 rounded-2xl bg-[#64748b] text-white font-bold hover:scale-105 transition-transform"
        >
          📺 Host TV Mode
        </button>

        <button
          onClick={randomPlayerShow}
          className="w-full p-4 mt-4 rounded-2xl bg-[#3b82f6] text-white font-bold hover:scale-105 transition-transform"
        >
          🎰 اختيار اللاعب القادم
        </button>

        <button
          onClick={startRound}
          className="w-full p-4 mt-4 rounded-2xl bg-[#10b981] text-white font-bold hover:scale-105 transition-transform"
        >
          🎲 ابدأ الجولة
        </button>

        <button
          onClick={endGame}
          className="w-full p-4 mt-4 rounded-2xl bg-[#ef4444] text-white font-bold hover:scale-105 transition-transform"
        >
          ⛔ إنهاء اللعبة
        </button>

        <SpinWheel spinState={spinState} isHostMode={isHostMode} />

        <RoundDisplay round={currentRound} elementId="admin-round" isHostMode={isHostMode} />

        {currentRound && (
          <button
            onClick={revealAnswerEarly}
            className="w-full p-4 mt-4 rounded-2xl bg-[#f97316] text-white font-bold hover:scale-105 transition-transform"
          >
            👁️ عرض الإجابة الآن
          </button>
        )}

        <VotingPanel
          votes={votes}
          onVote={vote}
          onFinishVoting={finishVoting}
          isAdmin={true}
          isHostMode={isHostMode}
        />
      </div>
    </div>
  );
}
