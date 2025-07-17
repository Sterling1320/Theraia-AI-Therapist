
'use client';

import {
  generateConcludingMessage,
  getInitialTherapyResponse,
  getContinuedTherapyResponse,
  processSession,
  processIntroduction,
  getWelcomeBackMessage,
} from '@/app/session/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Download,
  FileUp,
  Loader2,
  Pause,
  Send,
  User,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Skeleton } from './ui/skeleton';
import { Textarea } from './ui/textarea';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import AudioPlayer from './audio-player';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

type SessionState =
  | 'initial'
  | 'upload'
  | 'gatheringInfo'
  | 'chatting'
  | 'concluding'
  | 'concluded';

// Simple Cipher Functions
const simpleEncrypt = (text: string): string => {
  return text
    .split('')
    .map((char) => {
      if (char >= 'a' && char <= 'z') {
        return char === 'z' ? 'a' : String.fromCharCode(char.charCodeAt(0) + 1);
      }
      if (char >= 'A' && char <= 'Z') {
        return char === 'Z' ? 'A' : String.fromCharCode(char.charCodeAt(0) + 1);
      }
      if (char >= '0' && char <= '9') {
        return char === '9' ? '0' : String.fromCharCode(char.charCodeAt(0) + 1);
      }
      return char;
    })
    .join('');
};

const simpleDecrypt = (text: string): string => {
  return text
    .split('')
    .map((char) => {
      if (char >= 'a' && char <= 'z') {
        return char === 'a' ? 'z' : String.fromCharCode(char.charCodeAt(0) - 1);
      }
      if (char >= 'A' && char <= 'Z') {
        return char === 'A' ? 'Z' : String.fromCharCode(char.charCodeAt(0) - 1);
      }
      if (char >= '0' && char <= '9') {
        return char === '0' ? '9' : String.fromCharCode(char.charCodeAt(0) - 1);
      }
      return char;
    })
    .join('');
};

const stoicQuotes = [
    {
      quote:
        'The happiness of your life depends upon the quality of your thoughts.',
      author: 'Marcus Aurelius',
    },
    {
      quote:
        'Waste no more time arguing about what a good person should be. Be one.',
      author: 'Marcus Aurelius',
    },
    {
      quote:
        'It is not death that a person should fear, but they should fear never beginning to live.',
      author: 'Marcus Aurelius',
    },
    {
      quote:
        'First say to yourself what you would be; and then do what you have to do.',
      author: 'Epictetus',
    },
    {
      quote:
        'Very little is needed to make a happy life; it is all within yourself in your way of thinking.',
      author: 'Marcus Aurelius',
    },
    {
      quote:
        'Nowhere can a person find a quieter or more troubled retreat than in their own soul.',
      author: 'Marcus Aurelius',
    },
    {
      quote:
        'Freedom is the only worthy goal in life. It is won by disregarding things that lie beyond our control.',
      author: 'Epictetus',
    },
    {
      quote:
        'It is not the one who has too little, but the one who craves more, that is poor.',
      author: 'Lucius Annaeus Seneca',
    },
    {
      quote: 'Freedom is not achieved by satisfying desire but by eliminating it.',
      author: 'Epictetus',
    },
    {
      quote:
        'To wish to be well is a part of becoming well.',
      author: 'Lucius Annaeus Seneca',
    },
  ];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>('initial');
  const [sessionHistory, setSessionHistory] = useState<string | undefined>(
    undefined
  );
  const [userName, setUserName] = useState('');
  const [userIntro, setUserIntro] = useState('');

  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, sessionState, scrollToBottom]);

  const startFirstSession = () => {
    setSessionState('gatheringInfo');
    setMessages([]); // Clear any previous state
    setIsLoading(true);
    setTimeout(() => {
      setMessages([
        {
          role: 'bot',
          content: `Welcome to Theraia. I’m Sage, your personal AI therapist. You can talk to me about anything that’s on your mind, no pressure, just whatever feels right to share.

To begin, why don’t you tell me a little about yourself? Whatever you feel comfortable sharing is perfectly okay.`,
        },
      ]);
      setIsLoading(false);
    }, 1500);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    setSessionState('upload');

    try {
      const encryptedRecord = await file.text();
      const sessionRecord = simpleDecrypt(encryptedRecord);
      setSessionHistory(sessionRecord);

      const { userName, message } = await getWelcomeBackMessage({
        sessionRecord,
      });
      setUserName(userName);

      setMessages([{ role: 'bot', content: message }]);
      setSessionState('chatting');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Failed to Read Record',
        description:
          error.message ||
          'Could not read the record. Please ensure you uploaded the correct file.',
      });
      setSessionState('initial');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInfoGathering = async () => {
    const userMessage: Message = { role: 'user', content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const { name, introduction, response } = await processIntroduction({
        message: currentInput,
      });
      setUserName(name);
      setUserIntro(introduction);
      setMessages((prev) => [...prev, { role: 'bot', content: response }]);
      setSessionState('chatting');
    } catch (error) {
      console.error('Failed to process introduction:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'There was an issue processing your introduction. Please try again.',
      });
      // Revert to allow user to try again
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatMessage = async () => {
    const userMessage: Message = { role: 'user', content: inputValue };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      let result;
      if (sessionHistory) {
        result = await getContinuedTherapyResponse({
          message: currentInput,
          sessionRecord: sessionHistory,
        });
      } else {
        const chatLog = currentMessages
          .map((m) => `${m.role === 'user' ? 'User' : 'Therapist'}: ${m.content}`)
          .join('\n');
        result = await getInitialTherapyResponse({
          message: currentInput,
          chatLog: chatLog,
        });
      }

      const botMessage: Message = { role: 'bot', content: result.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to get response:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'Could not connect to the therapist bot. Please try again.',
      });
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    if (sessionState === 'gatheringInfo') {
      handleInfoGathering();
    } else if (sessionState === 'chatting') {
      handleChatMessage();
    }
  };

  const handleConcludeSession = async () => {
    if (isLoading || sessionState !== 'chatting' || messages.length < 2)
      return;
    setIsLoading(true);
    setSessionState('concluding');

    const chatLog = messages
      .map((m) =>
        `${m.role === 'user' ? userName || 'Patient' : 'Therapist'}: ${
          m.content
        }`
      )
      .join('\n');

    try {
      const { message: concludingMessage } = await generateConcludingMessage({
        chatLog,
      });
      const concludingBotMessage: Message = {
        role: 'bot',
        content: concludingMessage,
      };
      setMessages((prev) => [...prev, concludingBotMessage]);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const { sessionRecord } = await processSession({
        chatLog,
        previousSummary: sessionHistory,
        userName: userName || undefined,
        userIntro: userIntro || undefined,
      });

      const encryptedRecord = simpleEncrypt(sessionRecord);
      const blob = new Blob([encryptedRecord], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download =
        userName && userName !== 'User'
          ? `${userName}-session-record.txt`
          : 'theraia_record.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const finalMessage = sessionHistory
        ? 'That brings our session to a close. I’ve prepared your updated session record — feel free to overwrite the previous one or delete it if you prefer. Be sure to keep the new record safe for our next conversation. Take care until then.'
        : 'Our session has now concluded. Your session record has been downloaded. Please keep it safe for our next session. Take care.';

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: finalMessage,
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
      setSessionState('chatting');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholderText = () => {
    if (sessionState === 'gatheringInfo') {
      return 'Please introduce yourself...';
    }
    if (sessionState === 'chatting') {
      return 'Type your message here...';
    }
    return 'Concluding session...';
  };

  const renderInitialScreen = () => (
    <div className="flex flex-1 flex-col items-center justify-center space-y-8 text-center">
      <h2 className="font-headline text-4xl md:text-5xl">Welcome to Theraia 🙏</h2>
      <p className="max-w-md text-lg text-muted-foreground md:text-xl">
        Is this your first session, or are you returning with a session record?
      </p>
      <div className="flex w-full max-w-sm flex-col items-stretch space-y-4 sm:flex-row sm:justify-center sm:gap-4 sm:space-y-0 sm:items-center">
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
      <div className="w-full max-w-sm pt-8">
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent>
            {stoicQuotes.map((item, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-video items-center justify-center p-6 text-center">
                      <div className="space-y-4">
                        <p className="font-body text-lg italic text-foreground">
                          &ldquo;{item.quote}&rdquo;
                        </p>
                        <p className="font-headline text-muted-foreground">
                          - {item.author}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );

  const renderUploadScreen = () => (
    <div className="flex flex-1 flex-col items-center justify-center space-y-4 text-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground">
        Reviewing your session record...
      </p>
    </div>
  );

  return (
    <div className="relative z-10 mx-auto flex h-[100svh] max-w-4xl flex-col p-2 sm:p-4 md:p-6">
      <header className="flex flex-shrink-0 items-center justify-between border-b border-border/50 pb-4">
        <Link href="/" className="flex flex-shrink-0 items-center gap-2 md:gap-3">
          <Image
            src="/icon.JPG"
            alt="Theraia icon"
            width={66}
            height={66}
            className="h-12 w-12 rounded-full object-cover md:h-16 md:w-16"
            data-ai-hint="logo"
          />
          <h1 className="font-headline text-2xl font-bold md:text-3xl">Theraia</h1>
        </Link>
        <div className="flex items-center gap-2">
          {sessionState === 'chatting' && (
            <Button
              variant="outline"
              onClick={handleConcludeSession}
              disabled={isLoading || messages.length < 2}
              className="whitespace-nowrap"
            >
              <Pause className="mr-2 h-4 w-4" />
              Conclude Session
            </Button>
          )}
          {sessionState === 'concluding' && (
            <Button variant="outline" disabled className="whitespace-nowrap">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Concluding...
            </Button>
          )}
        </div>
      </header>

      <div className="my-4 flex-1 overflow-y-auto pr-2 md:my-6 md:pr-4">
        {sessionState === 'initial' && renderInitialScreen()}
        {sessionState === 'upload' && renderUploadScreen()}

        {(sessionState === 'gatheringInfo' ||
          sessionState === 'chatting' ||
          sessionState === 'concluding' ||
          sessionState === 'concluded') && (
          <div className="space-y-4 md:space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 md:gap-4 ${
                  message.role === 'user' ? 'justify-end' : ''
                }`}
              >
                {message.role === 'bot' && (
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/clove-icon.jpeg" alt="Sage icon" />
                      <AvatarFallback>S</AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-muted-foreground font-body">Sage</p>
                  </div>
                )}
                <Card
                  className={`max-w-[85%] sm:max-w-md md:max-w-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card/80'
                  }`}
                >
                  <CardContent className="whitespace-pre-wrap p-3 font-body md:p-4">
                    {message.content}
                  </CardContent>
                </Card>
              </div>
            ))}
            {isLoading &&
              (sessionState === 'chatting' ||
                sessionState === 'gatheringInfo') && (
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/clove-icon.jpeg" alt="Sage icon" />
                      <AvatarFallback>S</AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-muted-foreground font-body">Sage</p>
                  </div>
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

      {(sessionState === 'gatheringInfo' ||
        sessionState === 'chatting' ||
        sessionState === 'concluding') && (
        <footer className="border-t border-border/50 pt-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex items-end gap-2 md:gap-4">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={getPlaceholderText()}
              className="flex-1 resize-none bg-background/80"
              rows={2}
              disabled={
                isLoading ||
                sessionState === 'concluding' ||
                sessionState === 'concluded'
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <AudioPlayer />
            <Button
              type="submit"
              size="icon"
              disabled={
                isLoading ||
                !inputValue.trim() ||
                sessionState === 'concluding' ||
                sessionState === 'concluded'
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
