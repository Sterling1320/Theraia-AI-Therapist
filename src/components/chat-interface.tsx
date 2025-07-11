'use client';

import {
  decryptSessionRecord,
  generateConcludingMessage,
  getTherapyResponse,
  processAndEncryptSession,
} from '@/app/session/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Bot,
  Download,
  FileUp,
  Loader2,
  Pause,
  Send,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Skeleton } from './ui/skeleton';
import { Textarea } from './ui/textarea';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

type SessionState =
  | 'initial'
  | 'upload'
  | 'chatting'
  | 'concluding'
  | 'concluded';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>('initial');
  const [sessionHistory, setSessionHistory] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (sessionState === 'initial' || sessionState === 'chatting') {
      scrollToBottom();
    }
  }, [messages, isLoading, sessionState]);

  const startFirstSession = () => {
    setMessages([
      {
        role: 'bot',
        content:
          "Welcome to Theraia. It's brave to take this first step. I'm here to listen. What's on your mind today?",
      },
    ]);
    setSessionState('chatting');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    setSessionState('upload');

    try {
      const encryptedRecord = await file.text();
      const decryptedHistory = await decryptSessionRecord(encryptedRecord);
      setSessionHistory(decryptedHistory);
      setMessages([
        {
          role: 'bot',
          content:
            'Thank you for providing your record. I have reviewed your previous session notes. How are you feeling today?',
        },
      ]);
      setSessionState('chatting');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Decryption Failed',
        description:
          error.message ||
          'Could not read the record. Please ensure you uploaded the correct file.',
      });
      setSessionState('initial');
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || sessionState !== 'chatting') return;

    const userMessage: Message = { role: 'user', content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await getTherapyResponse({
        message: userMessage.content,
        history: sessionHistory,
      });
      const botMessage: Message = { role: 'bot', content: result.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to get response:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not connect to the therapist bot. Please try again.',
      });
      setMessages((prev) => prev.slice(0, -1)); // Remove optimistic user message
    } finally {
      setIsLoading(false);
    }
  };

  const handleConcludeSession = async () => {
    if (isLoading || sessionState !== 'chatting' || messages.length < 2) return;
    setIsLoading(true);
    setSessionState('concluding');

    const chatLog = messages
      .map((m) => `${m.role === 'user' ? 'Patient' : 'Therapist'}: ${m.content}`)
      .join('\n');

    try {
      // 1. Get personalized concluding message
      const { message: concludingMessage } = await generateConcludingMessage({ chatLog });
      const concludingBotMessage: Message = { role: 'bot', content: concludingMessage };
      setMessages((prev) => [...prev, concludingBotMessage]);

      // Give a moment for the user to read the message.
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2. Process and encrypt the session
      const { encryptedRecord } = await processAndEncryptSession({
        chatLog,
        previousSummary: sessionHistory,
      });

      // 3. Trigger download
      const blob = new Blob([encryptedRecord], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'psych_record.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // 4. Add final message and set state
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content:
            'Our session has now concluded. Your encrypted session record has been downloaded. Please keep it safe for our next session. Take care.',
        },
      ]);
      setSessionState('concluded');
    } catch (error) {
      console.error('Failed to conclude session:', error);
      toast({
        variant: 'destructive',
        title: 'Error Concluding Session',
        description: 'There was an issue generating your session record.',
      });
      setSessionState('chatting'); // Revert state
    } finally {
      setIsLoading(false);
    }
  };

  const renderInitialScreen = () => (
    <div className="flex flex-1 flex-col items-center justify-center space-y-6 text-center">
      <h2 className="font-headline text-3xl">Welcome to Theraia</h2>
      <p className="max-w-md text-muted-foreground">
        Is this your first session, or are you returning with a session record?
      </p>
      <div className="flex gap-4">
        <Button onClick={startFirstSession}>This is my first session</Button>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileUp className="mr-2" />
          Upload Record
        </Button>
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".txt"
        />
      </div>
    </div>
  );

  const renderUploadScreen = () => (
    <div className="flex flex-1 flex-col items-center justify-center space-y-4 text-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground">
        Decrypting and loading your session record...
      </p>
    </div>
  );

  return (
    <div className="relative z-10 mx-auto flex h-screen max-w-4xl flex-col p-4 md:p-6">
      <header className="flex items-center justify-between border-b border-border/50 pb-4">
        <Link href="/" className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold">
            Theraia
          </h1>
        </Link>
        {sessionState === 'chatting' && (
          <Button
            variant="outline"
            onClick={handleConcludeSession}
            disabled={isLoading || messages.length < 2}
          >
            <Pause className="mr-2" />
            Conclude Session
          </Button>
        )}
         {sessionState === 'concluding' && (
          <Button
            variant="outline"
            disabled
          >
            <Loader2 className="mr-2 animate-spin" />
            Concluding...
          </Button>
        )}
      </header>

      <div className="my-6 flex-1 overflow-y-auto pr-4">
        {sessionState === 'initial' && renderInitialScreen()}
        {sessionState === 'upload' && renderUploadScreen()}

        {(sessionState === 'chatting' ||
          sessionState === 'concluding' ||
          sessionState === 'concluded') && (
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 ${
                  message.role === 'user' ? 'justify-end' : ''
                }`}
              >
                {message.role === 'bot' && (
                  <Avatar>
                    <AvatarFallback>
                      <Bot />
                    </AvatarFallback>
                  </Avatar>
                )}
                <Card
                  className={`max-w-md ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card/80'
                  }`}
                >
                  <CardContent className="whitespace-pre-wrap p-4 font-body">
                    {message.content}
                  </CardContent>
                </Card>
                {message.role === 'user' && (
                  <Avatar>
                    <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && sessionState === 'chatting' && (
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback>
                    <Bot />
                  </AvatarFallback>
                </Avatar>
                <Card className="max-w-md bg-card/80">
                  <CardContent className="space-y-2 p-4">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </CardContent>
                </Card>
              </div>
            )}
            {sessionState === 'concluded' && (
              <div className="py-8 text-center font-body text-muted-foreground">
                <p>Session has ended.</p>
                <Link href="/" className="mt-2 inline-block">
                  <Button variant="link">Return to Home</Button>
                </Link>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {(sessionState === 'chatting' || sessionState === 'concluding') && (
        <footer className="border-t border-border/50 pt-4">
          <form onSubmit={handleSubmit} className="flex items-start gap-4">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                sessionState === 'chatting'
                  ? 'Type your message here...'
                  : 'Concluding session...'
              }
              className="flex-1 resize-none bg-background/80"
              rows={2}
              disabled={isLoading || sessionState !== 'chatting'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={
                isLoading || !inputValue.trim() || sessionState !== 'chatting'
              }
            >
              <Send />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </footer>
      )}
    </div>
  );
}
