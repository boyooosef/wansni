import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import HomeScreen from './components/HomeScreen';
import AdminScreen from './components/AdminScreen';
import PlayerScreen from './components/PlayerScreen';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpk3UNRpaAqsjseQQzxFlYCj5BabAwpKQ",
  authDomain: "wansni.firebaseapp.com",
  databaseURL: "https://wansni-default-rtdb.firebaseio.com",
  projectId: "wansni",
  storageBucket: "wansni.firebasestorage.app",
  messagingSenderId: "315838161219",
  appId: "1:315838161219:web:dfeb588b0f4c83470acff6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export type Screen = 'home' | 'admin' | 'player';

export interface GameState {
  screen: Screen;
  roomCode: string;
  playerId: string;
  playerName: string;
  isAdmin: boolean;
}

export default function App() {
  console.log('🇰🇼 WanSni v2.1 - UI Update Loaded');

  const [gameState, setGameState] = useState<GameState>({
    screen: 'home',
    roomCode: '',
    playerId: '',
    playerName: '',
    isAdmin: false,
  });
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Register Service Worker for auto updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js', { scope: '/' })
        .then((registration) => {
          console.log('✅ Service Worker registered');
          setSwRegistration(registration);

          // Check for updates every 60 seconds
          setInterval(() => {
            registration.update();
          }, 60000);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 New version available!');
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('❌ SW registration failed:', error);
        });

      // Listen for controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  // Check URL for room code
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');

    if (roomFromUrl) {
      setGameState(prev => ({
        ...prev,
        roomCode: roomFromUrl,
        screen: 'player'
      }));
    }
  }, []);

  const forceUpdate = () => {
    if (swRegistration) {
      swRegistration.update().then(() => {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      });
    } else {
      window.location.reload();
    }
  };

  const installUpdate = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center p-4"
         style={{
           background: 'radial-gradient(circle at top, rgba(124,58,237,0.35), transparent 35%), radial-gradient(circle at bottom, rgba(59,130,246,0.25), transparent 35%), linear-gradient(to bottom, #081028, #050816)'
         }}>

      {/* Update Notification */}
      {updateAvailable && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-[100]
                        p-4 rounded-2xl bg-[#7c3aed] text-white shadow-2xl
                        animate-in slide-in-from-bottom-5">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🎉</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">تحديث جديد متوفر!</h3>
              <p className="text-sm text-white/90 mb-3">
                يوجد نسخة جديدة من اللعبة. اضغط تحديث للحصول على آخر المميزات.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={installUpdate}
                  className="px-4 py-2 rounded-xl bg-white text-[#7c3aed] font-bold
                             hover:scale-105 transition-transform"
                >
                  ✨ تحديث الآن
                </button>
                <button
                  onClick={() => setUpdateAvailable(false)}
                  className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30
                             transition-colors"
                >
                  لاحقاً
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={forceUpdate}
        className="fixed top-4 left-4 w-11 h-11 rounded-full bg-[#ffd500] text-black text-xl font-bold
                   hover:scale-110 transition-transform shadow-lg z-50"
        title="تحديث"
      >
        🔄
      </button>

      <div className="w-full max-w-[620px]">
        {gameState.screen === 'home' && (
          <HomeScreen gameState={gameState} setGameState={setGameState} />
        )}
        {gameState.screen === 'admin' && (
          <AdminScreen gameState={gameState} setGameState={setGameState} />
        )}
        {gameState.screen === 'player' && (
          <PlayerScreen gameState={gameState} setGameState={setGameState} />
        )}

        <div className="text-center text-gray-500 text-xs mt-6">
          © جميع الحقوق محفوظة — ونّسني<br />
          تصميم وتطوير: BoYoOoSeF
        </div>
      </div>
    </div>
  );
}
