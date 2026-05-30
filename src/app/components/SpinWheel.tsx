import { SpinState } from '../types';

interface Props {
  spinState: SpinState | null;
  isHostMode: boolean;
}

export default function SpinWheel({ spinState, isHostMode }: Props) {
  if (!spinState) {
    return (
      <div className="p-4 rounded-2xl bg-black/30 mt-4">
        <h3
          className={`text-white font-bold text-center mb-3 ${
            isHostMode ? 'text-2xl' : ''
          }`}
        >
          🎬 اللاعب القادم
        </h3>
        <div className="text-white/60 text-center py-4">اضغط اختيار اللاعب القادم</div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-black/30 mt-4">
      <h3
        className={`text-white font-bold text-center mb-3 ${
          isHostMode ? 'text-2xl' : ''
        }`}
      >
        🎬 اللاعب القادم
      </h3>
      <div className="flex flex-col items-center justify-center py-4">
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spinWheel {
              from { transform: rotate(0deg) scale(1); }
              to { transform: rotate(360deg) scale(1.04); }
            }
          `
        }} />
        <div
          className={`w-[230px] h-[230px] rounded-full border-[10px] border-[#facc15]
                     flex items-center justify-center bg-gradient-to-b from-[#1e293b] to-[#020617]
                     shadow-[0_0_35px_rgba(250,204,21,0.7)]`}
          style={{
            animation: spinState.active ? 'spinWheel 0.5s linear infinite' : 'none',
          }}
        >
          <div className="text-center">
            <div className={`${isHostMode ? 'text-8xl' : 'text-7xl'}`}>
              {spinState.currentAvatar || "😎"}
            </div>
            <div className={`text-[#facc15] font-bold mt-2 ${isHostMode ? 'text-3xl' : 'text-2xl'}`}>
              {spinState.currentName || "..."}
            </div>
          </div>
        </div>

        <div
          className={`mt-3 font-bold ${
            spinState.active ? 'text-[#38bdf8]' : 'text-[#4ade80]'
          } ${isHostMode ? 'text-2xl' : 'text-xl'}`}
        >
          {spinState.active ? "🎡 جاري الاختيار..." : "🎯 اللاعب المختار"}
        </div>
      </div>
    </div>
  );
}
