'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

// --- Playlist ---
// Add your music file paths here.
// They must be in the `public/calm-music` folder.
const playlist = [
  '/calm-music/track1.mp3', // Replace with your actual filenames
  '/calm-music/track2.mp3',
  '/calm-music/track3.mp3',
];

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('');

  const playRandomTrack = () => {
    const randomIndex = Math.floor(Math.random() * playlist.length);
    const track = playlist[randomIndex];
    setCurrentTrack(track);

    if (audioRef.current) {
      audioRef.current.src = track;
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  };

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = 0.3;

    // When a track ends, play another random one
    audioRef.current.addEventListener('ended', playRandomTrack);
    
    // Select the first track to play
    playRandomTrack();

    return () => {
      audioRef.current?.pause();
      audioRef.current?.removeEventListener('ended', playRandomTrack);
    };
  }, []); // This effect runs only once on mount

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        if (!audioRef.current.src) {
           playRandomTrack();
        }
        audioRef.current.play().catch((error) => console.error('Audio playback failed:', error));
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
