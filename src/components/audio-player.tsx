
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

// --- Playlist ---
// Add your music file paths here.
// They must be in the `public/calm-music` folder.
const playlist = [
  '/calm-music/1.mp3',
  '/calm-music/2.mp3',
  '/calm-music/3.mp3',
  '/calm-music/4.mp3',
  '/calm-music/5.mp3',
  '/calm-music/6.mp3',
];

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTrack, setCurrentTrack] = useState('');

  const playRandomTrack = useCallback(() => {
    if (!audioRef.current) return;

    let randomIndex;
    let nextTrack;
    do {
      randomIndex = Math.floor(Math.random() * playlist.length);
      nextTrack = playlist[randomIndex];
    } while (nextTrack === currentTrack && playlist.length > 1);

    setCurrentTrack(nextTrack);
    audioRef.current.src = nextTrack;
    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Audio play failed:', error);
        }
      });
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    // Create audio element once.
    if (!audioRef.current) {
      const audio = new Audio();
      audio.volume = 0.3;
      audio.addEventListener('ended', playRandomTrack);
      audioRef.current = audio;
    }

    if (isPlaying) {
      if (!audioRef.current.src) {
        playRandomTrack();
      } else {
        audioRef.current.play().catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Audio play failed:', error);
          }
        });
      }
    } else {
      audioRef.current.pause();
    }

    return () => {
      // Only remove the event listener on final cleanup.
      // We don't want to pause here as it causes issues in React 18 strict mode.
    };
  }, [isPlaying, playRandomTrack]);

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="fixed top-4 right-4 z-20">
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlayPause}
        aria-label="Toggle music"
      >
        {isPlaying ? (
          <Volume2 className="h-8 w-8" />
        ) : (
          <VolumeX className="h-8 w-8" />
        )}
      </Button>
    </div>
  );
}
