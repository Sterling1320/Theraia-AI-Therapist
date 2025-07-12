'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

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
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const playNextTrack = useCallback(() => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    audioRef.current = new Audio(playlist[currentTrackIndex]);
    audioRef.current.volume = 0.3;
    audioRef.current.loop = false;

    const currentAudio = audioRef.current;
    currentAudio.addEventListener('ended', playNextTrack);

    if (isPlaying) {
      currentAudio.play().catch((e) => {
        if (e.name !== 'AbortError') {
          console.warn('Autoplay prevented:', e.message);
          setIsPlaying(false);
        }
      });
    }
    
    return () => {
      currentAudio.pause();
      currentAudio.removeEventListener('ended', playNextTrack);
      currentAudio.src = '';
      audioRef.current = null;
    };
  }, [currentTrackIndex, isPlaying, playNextTrack]);


  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="flex-shrink-0">
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlayPause}
        aria-label="Toggle music"
        className="h-10 w-10"
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
