import { useCallback } from 'react';

// Cache for audio objects
const soundCache: Record<string, HTMLAudioElement> = {};

export type SoundName =
  | 'vote'      // عند التصويت
  | 'spin'      // عند دوران العجلة
  | 'tick'      // آخر 5 ثواني من المؤقت
  | 'correct'   // إجابة صحيحة
  | 'wrong'     // إجابة خاطئة
  | 'winner';   // عند الفوز

export const SOUND_FILES: Record<SoundName, string> = {
  vote: '/sounds/vote.mp3',
  spin: '/sounds/spin.mp3',
  tick: '/sounds/tick.mp3',
  correct: '/sounds/correct.mp3',
  wrong: '/sounds/wrong.mp3',
  winner: '/sounds/winner.mp3'
};

export function useSound() {
  const playSound = useCallback((soundName: SoundName, volume: number = 0.7) => {
    try {
      const soundPath = SOUND_FILES[soundName];

      // Check if sound file exists (optional)
      if (!soundPath) {
        console.warn(`Sound "${soundName}" not found`);
        return;
      }

      // Get or create audio object
      if (!soundCache[soundPath]) {
        soundCache[soundPath] = new Audio(soundPath);
      }

      const audio = soundCache[soundPath];

      // Reset and play
      audio.pause();
      audio.currentTime = 0;
      audio.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1

      audio.play().catch((error) => {
        // Silently fail if user hasn't interacted yet (autoplay policy)
        console.debug(`Could not play sound "${soundName}":`, error.message);
      });
    } catch (error) {
      console.error(`Error playing sound "${soundName}":`, error);
    }
  }, []);

  return { playSound };
}

// Standalone function for non-React contexts
export function playSound(soundName: SoundName, volume: number = 0.7): void {
  try {
    const soundPath = SOUND_FILES[soundName];

    if (!soundPath) {
      console.warn(`Sound "${soundName}" not found`);
      return;
    }

    if (!soundCache[soundPath]) {
      soundCache[soundPath] = new Audio(soundPath);
    }

    const audio = soundCache[soundPath];

    audio.pause();
    audio.currentTime = 0;
    audio.volume = Math.max(0, Math.min(1, volume));

    audio.play().catch((error) => {
      console.debug(`Could not play sound "${soundName}":`, error.message);
    });
  } catch (error) {
    console.error(`Error playing sound "${soundName}":`, error);
  }
}
