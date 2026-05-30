import { useState, useEffect, useRef } from 'react';
import { Round } from '../types';
import { playSound } from '../hooks/useSound';

interface Props {
  round: Round | null;
  elementId: string;
  isHostMode: boolean;
}

export default function RoundDisplay({ round, elementId, isHostMode }: Props) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPrepPhase, setIsPrepPhase] = useState(false);
  const lastTickRef = useRef(0);

  useEffect(() => {
    if (!round) {
      setTimeLeft(0);
      setIsPrepPhase(false);
      lastTickRef.current = 0;
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - round.startedAt) / 1000);

      if (elapsed < round.prepSeconds) {
        const left = round.prepSeconds - elapsed;
        setTimeLeft(left);
        setIsPrepPhase(true);
      } else {
        const answerElapsed = elapsed - round.prepSeconds;
        const left = Math.max(round.answerSeconds - answerElapsed, 0);
        setTimeLeft(left);
        setIsPrepPhase(false);

        // Play tick sound for last 5 seconds
        if (left > 0 && left <= 5 && left !== lastTickRef.current && round.phase !== 'finished') {
          playSound('tick', 0.3);
          lastTickRef.current = left;
        }
      }
    }, 100);

    return () => {
      clearInterval(interval);
      lastTickRef.current = 0;
    };
  }, [round]);

  if (!round) {
    return <div className="text-white/60 text-center py-4">بانتظار بدء الجولة...</div>;
  }

  const showAnswer = timeLeft === 0 || round.answerRevealed;

  return (
    <div>
      <h2
        className={`text-white font-bold ${
          isHostMode ? 'text-3xl' : 'text-xl'
        }`}
      >
        🎯 الدور على: {round.playerName}
      </h2>
      <p className={`text-white/80 mt-1 ${isHostMode ? 'text-xl' : ''}`}>
        📚 القسم: {round.categoryName}
      </p>
      <div
        className={`text-[#facc15] font-bold my-3 ${
          isHostMode ? 'text-6xl' : 'text-5xl'
        }`}
      >
        {timeLeft}
      </div>

      {isPrepPhase ? (
        <div className={`text-white/70 ${isHostMode ? 'text-2xl' : ''}`}>استعد...</div>
      ) : (
        <>
          <div
            className={`text-white font-bold leading-relaxed my-3 ${
              isHostMode ? 'text-3xl border-4 border-[#facc15] p-4 rounded-2xl shadow-[0_0_40px_rgba(250,204,21,0.45)]' : 'text-2xl'
            }`}
          >
            {round.question}
          </div>

          {showAnswer && (
            <div className="text-[#86efac] font-bold mt-3 p-3 rounded-xl bg-green-900/30">
              الإجابة: {round.answer}
            </div>
          )}

          <p className={`text-white/70 mt-2 ${isHostMode ? 'text-xl' : ''}`}>
            النقاط: {round.points}
          </p>
        </>
      )}
    </div>
  );
}
