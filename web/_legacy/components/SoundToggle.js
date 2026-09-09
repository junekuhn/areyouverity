'use client';

import { useState, useEffect } from 'react';
import soundManager from '@/lib/soundManager';

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEnabled(soundManager.enabled);

    // Initialize audio context on first interaction
    if (soundManager.enabled) {
      soundManager.init();
    }
  }, []);

  const toggleSound = () => {
    const newState = soundManager.toggle();
    setEnabled(newState);

    // Play test sound
    if (newState) {
      setTimeout(() => soundManager.playClick(), 50);
    }
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleSound}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full border border-white/20 bg-black/80 backdrop-blur-sm hover:bg-white/10 transition flex items-center justify-center group"
      title={enabled ? 'Mute sounds' : 'Enable sounds'}
    >
      {enabled ? (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      ) : (
        <svg
          className="w-6 h-6 text-white/40"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black border border-white/20 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
        {enabled ? 'Sounds ON' : 'Sounds OFF'}
      </div>
    </button>
  );
}
