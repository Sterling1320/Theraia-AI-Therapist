import AudioPlayer from '@/components/audio-player';
import ChatInterface from '@/components/chat-interface';

export default function SessionPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <AudioPlayer />
      <ChatInterface />
    </div>
  );
}
