import AudioPlayer from '@/components/audio-player';
import ChatInterface from '@/components/chat-interface';

export default function SessionPage() {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop')",
      }}
      data-ai-hint="mountain landscape"
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[3px]" />
      <AudioPlayer />
      <ChatInterface />
    </div>
  );
}
