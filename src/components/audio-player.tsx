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
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const playNextTrack = useCallback(() => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  }, []);

  useEffect(() => {
    const audio = new Audio(playlist[currentTrackIndex]);
    audio.volume = 0.3;
    audio.addEventListener('ended', playNextTrack);
    audioRef.current = audio;

    if (isPlaying) {
      audio.play().catch((e) => {
        if (e.name === 'NotAllowedError') {
          console.log('Autoplay was prevented. User interaction is needed.');
          setIsPlaying(false);
        } else {
          console.error('Audio play error:', e);
        }
      });
    }

    return () => {
      audio.pause();
      audio.removeEventListener('ended', playNextTrack);
      audio.src = ''; // Unload the audio source
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.src = playlist[currentTrackIndex];

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          if (error.name === 'NotAllowedError') {
            setIsPlaying(false);
          } else {
            console.error('Audio play error:', error);
          }
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="absolute bottom-[90px] right-4 z-20 md:bottom-24">
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
