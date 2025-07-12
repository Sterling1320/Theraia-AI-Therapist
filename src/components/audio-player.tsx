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
    // Only run on the client
    if (typeof window === 'undefined') return;

    // Create a new audio element
    const audio = new Audio(playlist[currentTrackIndex]);
    audio.volume = 0.3;
    audio.loop = false;
    audio.addEventListener('ended', playNextTrack);
    audioRef.current = audio;

    if (isPlaying) {
      // Attempt to play, but catch errors (e.g., autoplay blocked)
      audio.play().catch((e) => {
        console.warn('Autoplay prevented:', e.message);
        setIsPlaying(false); // Reset state if play fails
      });
    }

    // Cleanup function
    return () => {
      // Pause and release the audio source to prevent memory leaks
      audio.pause();
      audio.removeEventListener('ended', playNextTrack);
      audio.src = ''; // Release the audio source
      audioRef.current = null;
    };
    // Re-run this effect only when the track index changes
  }, [currentTrackIndex, playNextTrack]);

  // Effect to handle play/pause state changes
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch((e) => {
        // Handle cases where play is interrupted or fails
        if (e.name !== 'AbortError') {
          console.warn('Could not play audio:', e.message);
          setIsPlaying(false);
        }
      });
    } else {
      audioRef.current.pause();
    }
    // This effect depends only on the isPlaying state
  }, [isPlaying]);

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
