
'use client';

import { useEffect, useRef, useState } from 'react';
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

  const playRandomTrack = () => {
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
      audioRef.current.play().catch(console.error);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.volume = 0.3;
      audioRef.current.addEventListener('ended', playRandomTrack);

      // This logic prevents the development-mode double-mount race condition
      let isMounted = true;
      if (isMounted) {
        playRandomTrack();
      }

      return () => {
        isMounted = false;
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeEventListener('ended', playRandomTrack);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      const newIsPlaying = !isPlaying;
      if (newIsPlaying) {
        if (!audioRef.current.src) {
            playRandomTrack();
        } else {
            audioRef.current.play().catch(console.error);
        }
      } else {
        audioRef.current.pause();
      }
      setIsPlaying(newIsPlaying);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-10">
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
