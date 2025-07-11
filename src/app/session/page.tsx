import AudioPlayer from '@/components/audio-player';
import ChatInterface from '@/components/chat-interface';

export default function SessionPage() {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1887&auto=format&fit=crop')",
      }}
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      <AudioPlayer />
      <ChatInterface />
    </div>
  );
}
