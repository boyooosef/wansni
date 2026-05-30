import { Vote } from '../types';

interface Props {
  votes: Record<string, Vote>;
  onVote: (result: 'success' | 'fail') => void;
  onFinishVoting: () => void;
  isAdmin: boolean;
  isHostMode: boolean;
}

export default function VotingPanel({ votes, onVote, onFinishVoting, isAdmin, isHostMode }: Props) {
  let success = 0;
  let fail = 0;

  Object.values(votes).forEach((v) => {
    if (v.vote === "success") success++;
    if (v.vote === "fail") fail++;
  });

  if (isHostMode) {
    return null;
  }

  return (
    <div className="p-4 rounded-2xl bg-black/30 mt-4">
      <h3 className="text-white font-bold text-center mb-3">🗳️ التصويت</h3>

      <div className="text-white text-center space-y-2 mb-3">
        <div>✅ نجح: {success}</div>
        <div>❌ فشل: {fail}</div>
      </div>

      {isAdmin && (
        <>
          <div className="flex gap-2">
            <button
              onClick={() => onVote('success')}
              className="flex-1 p-3 rounded-2xl bg-[#10b981] text-white font-bold hover:scale-105 transition-transform"
            >
              ✅ نجح
            </button>
            <button
              onClick={() => onVote('fail')}
              className="flex-1 p-3 rounded-2xl bg-[#ef4444] text-white font-bold hover:scale-105 transition-transform"
            >
              ❌ فشل
            </button>
          </div>

          <button
            onClick={onFinishVoting}
            className="w-full p-3 mt-3 rounded-2xl bg-[#22c55e] text-white font-bold hover:scale-105 transition-transform"
          >
            ✅ اعتماد التصويت
          </button>
        </>
      )}
    </div>
  );
}
