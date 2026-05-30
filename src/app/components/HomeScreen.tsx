import { useState } from 'react';
import { db, GameState } from '../App';
import { ref, set, push } from 'firebase/database';
import heroImage from '../../imports/wansni-hero.png';

interface Props {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export default function HomeScreen({ gameState, setGameState }: Props) {
  const [adminName, setAdminName] = useState('');
  const [winScore, setWinScore] = useState(70);
  const [roomInput, setRoomInput] = useState('');

  const changeWinScore = (amount: number) => {
    let newValue = winScore + amount;
    if (newValue < 10) newValue = 10;
    if (newValue > 500) newValue = 500;
    setWinScore(newValue);
  };

  const createRoom = async () => {
    const playerName = adminName.trim() || "الأدمن";
    const roomCode = Math.floor(1000 + Math.random() * 9000).toString();

    await set(ref(db, "rooms/" + roomCode), {
      createdAt: Date.now(),
      currentRound: null,
      status: "waiting",
      selectedCategory: "kuwait",
      usedQuestions: {},
      winScore: winScore
    });

    const adminRef = push(ref(db, "rooms/" + roomCode + "/players"));
    const playerId = adminRef.key!;

    await set(adminRef, {
      name: playerName,
      avatar: "👑",
      points: 0,
      admin: true,
      joinedAt: Date.now()
    });

    setGameState({
      screen: 'admin',
      roomCode,
      playerId,
      playerName,
      isAdmin: true
    });
  };

  const joinRoomByCode = () => {
    const code = roomInput.trim();
    if (code === "") {
      alert("اكتب رقم القعدة");
      return;
    }

    setGameState(prev => ({
      ...prev,
      roomCode: code,
      screen: 'player'
    }));
  };

  return (
    <div className="mt-8 max-w-lg mx-auto px-4">
      {/* Hero Image */}
      <div className="mb-6 animate-fade-in">
        <img
          src={heroImage}
          alt="ونّسني - لعبة القعدة الكويتية"
          className="w-full rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-2 border-[#d4af37]/30"
        />
      </div>

      {/* Main Card */}
      <div className="p-8 rounded-[28px] bg-gradient-to-br from-[rgba(25,35,60,0.97)] to-[rgba(15,25,50,0.97)] backdrop-blur-xl
                      shadow-[0_0_40px_rgba(212,175,55,0.2),0_20px_60px_rgba(0,0,0,0.4)]
                      border-2 border-[#d4af37]/20">

        {/* Create Room Section */}
        <div className="mb-8">
          <h2 className="text-[#d4af37] font-bold text-xl mb-4 flex items-center gap-2 drop-shadow-lg">
            <span className="text-2xl">👑</span>
            إنشاء قعدة جديدة
          </h2>

          <input
            className="w-full p-4 rounded-2xl text-lg border-none outline-none bg-white/95
                       focus:bg-white focus:ring-2 focus:ring-[#d4af37] transition-all
                       shadow-lg"
            placeholder="اكتب اسم الأدمن"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
          />

          <label className="block mt-5 text-[#d4af37]/90 font-bold text-sm mb-2 drop-shadow">
            🎯 نقاط الفوز
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => changeWinScore(-10)}
              className="px-5 py-4 rounded-xl bg-gradient-to-br from-[#c41e3a] to-[#a01828] text-white font-bold
                         hover:scale-110 hover:shadow-lg hover:shadow-[#c41e3a]/50 transition-all active:scale-95
                         border border-white/20"
            >
              ➖
            </button>

            <input
              type="number"
              className="flex-1 p-4 rounded-xl text-xl text-center font-bold border-2 border-[#d4af37]/30 outline-none
                         bg-gradient-to-br from-white to-[#fef9e7] text-[#1a2847]
                         focus:ring-2 focus:ring-[#d4af37] transition-all shadow-lg"
              value={winScore}
              onChange={(e) => setWinScore(parseInt(e.target.value) || 70)}
              min="10"
              max="500"
            />

            <button
              onClick={() => changeWinScore(10)}
              className="px-5 py-4 rounded-xl bg-gradient-to-br from-[#007a3d] to-[#005a2d] text-white font-bold
                         hover:scale-110 hover:shadow-lg hover:shadow-[#007a3d]/50 transition-all active:scale-95
                         border border-white/20"
            >
              ➕
            </button>
          </div>

          <button
            onClick={createRoom}
            className="w-full p-5 mt-5 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#f4d03f] to-[#d4af37]
                       text-[#1a2847] font-bold text-xl
                       hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#d4af37]/50
                       transition-all active:scale-95
                       shadow-lg border-2 border-[#f4d03f]/30"
          >
            <span className="drop-shadow-lg">👑 إنشاء القعدة</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#d4af37]/20"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 text-[#d4af37]/70 bg-[rgba(20,30,50,0.9)] text-sm font-bold">أو</span>
          </div>
        </div>

        {/* Join Room Section */}
        <div>
          <h2 className="text-[#d4af37] font-bold text-xl mb-4 flex items-center gap-2 drop-shadow-lg">
            <span className="text-2xl">📱</span>
            الانضمام لقعدة
          </h2>

          <input
            className="w-full p-4 rounded-2xl text-lg border-none outline-none bg-white/95
                       focus:bg-white focus:ring-2 focus:ring-[#d4af37] transition-all
                       shadow-lg"
            placeholder="اكتب رقم القعدة (مثال: 1234)"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
          />

          <button
            onClick={joinRoomByCode}
            className="w-full p-5 mt-4 rounded-2xl bg-gradient-to-r from-[#1a2847] via-[#243555] to-[#1a2847]
                       text-white font-bold text-xl
                       hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#1a2847]/50
                       transition-all active:scale-95
                       shadow-lg border-2 border-[#d4af37]/30"
          >
            <span className="drop-shadow-lg">📱 دخول القعدة</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-[#d4af37]/50 mt-6 text-sm font-bold drop-shadow">
        ونّسني © 2026 🇰🇼
      </p>
    </div>
  );
}
