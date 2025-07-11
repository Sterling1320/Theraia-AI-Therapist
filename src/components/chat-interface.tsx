'use client';

import { getTherapyResponse } from '@/app/session/actions';
import { useToast } from '@/hooks/use-toast';
import { Bot, Pause, Send, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Textarea } from './ui/textarea';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export default function ChatInterface() {
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content:
        "Hello, I'm TheraFlow. I'm here to listen. What's on your mind today?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionConcluded, setSessionConcluded] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let storedUserId = localStorage.getItem('theraflow-userId');
    if (!storedUserId) {
      storedUserId = crypto.randomUUID();
      localStorage.setItem('theraflow-userId', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || sessionConcluded || !userId) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await getTherapyResponse({
        userId,
        message: userMessage.content,
      });
      const botMessage: Message = { role: 'bot', content: response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to get response:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'Could not connect to the therapist bot. Please check your connection and try again.',
      });
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConcludeSession = async () => {
    if (isLoading || sessionConcluded || !userId) return;
    setIsLoading(true);

    try {
      const concludingMessage = "I'm ready to conclude our session for today.";
      const userMessage: Message = { role: 'user', content: concludingMessage };
      setMessages((prev) => [...prev, userMessage]);

      const response = await getTherapyResponse({
        userId,
        message: concludingMessage,
      });
      const botMessage: Message = {
        role: 'bot',
        content: `${response}\n\nOur session has now concluded. Remember, I'm here whenever you need to talk. Take care.`,
      };
      setMessages((prev) => [...prev, botMessage]);
      setSessionConcluded(true);
    } catch (error) {
      console.error('Failed to conclude session:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was an issue concluding the session. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-screen max-w-4xl flex-col p-4 md:p-6">
      <header className="flex items-center justify-between border-b pb-4">
        <Link href="/" className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold">TheraFlow Session</h1>
        </Link>
        <Button
          variant="outline"
          onClick={handleConcludeSession}
          disabled={isLoading || sessionConcluded}
        >
          <Pause className="mr-2 h-4 w-4" />
          Conclude Session
        </Button>
      </header>

      <div className="my-6 flex-1 overflow-y-auto pr-4">
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
                    : 'bg-card'
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
          {isLoading && (
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarFallback>
                  <Bot />
                </AvatarFallback>
              </Avatar>
              <Card className="max-w-md bg-card">
                <CardContent className="space-y-2 p-4">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </CardContent>
              </Card>
            </div>
          )}
          {sessionConcluded && (
            <div className="py-8 text-center font-body text-muted-foreground">
              <p>Session has ended.</p>
              <Link href="/" className="mt-2 inline-block">
                <Button variant="link">Return to Home</Button>
              </Link>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      <footer className="border-t pt-4">
        <form onSubmit={handleSubmit} className="flex items-start gap-4">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              sessionConcluded ? 'Session has ended.' : 'Type your message here...'
            }
            className="flex-1 resize-none"
            rows={2}
            disabled={isLoading || sessionConcluded}
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
            disabled={isLoading || !inputValue.trim() || sessionConcluded}
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </footer>
    </div>
  );
}
