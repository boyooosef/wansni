export interface Question {
  q: string;
  a: string;
  points: number;
}

export interface Category {
  name: string;
  time: number;
  questions: Question[];
}

export interface Player {
  name: string;
  avatar: string;
  points: number;
  admin: boolean;
  joinedAt: number;
}

export interface Round {
  playerId: string;
  playerName: string;
  categoryKey: string;
  categoryName: string;
  question: string;
  answer: string;
  points: number;
  prepSeconds: number;
  answerSeconds: number;
  startedAt: number;
  phase: 'prep' | 'answer' | 'finished';
  answerRevealed: boolean;
}

export interface SpinState {
  active: boolean;
  startedAt: number;
  playersCount: number;
  currentName?: string;
  currentAvatar?: string;
  counter?: number;
  selectedPlayerId?: string;
  finishedAt?: number;
}

export interface Room {
  createdAt: number;
  currentRound: Round | null;
  status: 'waiting' | 'playing' | 'finished' | 'ended';
  selectedCategory: string;
  usedQuestions: Record<string, Record<number, boolean>>;
  winScore: number;
  winner?: {
    name: string;
    avatar: string;
    points: number;
  };
}

export interface Vote {
  playerName: string;
  vote: 'success' | 'fail';
}
