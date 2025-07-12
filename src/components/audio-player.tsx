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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('');

  const playRandomTrack = () => {
    // This check prevents picking the same track twice in a row.
    let randomIndex;
    let nextTrack;
    do {
      randomIndex = Math.floor(Math.random() * playlist.length);
      nextTrack = playlist[randomIndex];
    } while (nextTrack === currentTrack && playlist.length > 1);

    setCurrentTrack(nextTrack);

    if (audioRef.current) {
      audioRef.current.src = nextTrack;
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  };

  useEffect(() => {
    // We need to check if window is defined to avoid issues with server-side rendering.
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.volume = 0.3;

      // When a track ends, play another random one
      audioRef.current.addEventListener('ended', playRandomTrack);

      // Select the first track to play
      playRandomTrack();

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeEventListener('ended', playRandomTrack);
        }
      };
    }
  }, []); // This effect runs only once on mount

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // If the src is not set, it means it's the very first play action.
        if (!audioRef.current.src) {
          playRandomTrack(); // This will set the src and then the play() call will work.
        }
        audioRef.current
          .play()
          .catch((error) =>
            console.error('Audio playback failed:', error)
          );
      }
      setIsPlaying(!isPlaying);
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
          <Volume2 className="h-6 w-6" />
        ) : (
          <VolumeX className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
