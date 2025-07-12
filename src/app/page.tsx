
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Play, Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="relative max-w-2xl text-center">
        <Image
          src="/icon.JPG"
          alt="Theraia icon"
          width={96}
          height={96}
          className="mx-auto rounded-full"
          data-ai-hint="logo"
          priority
        />
        <h1 className="mt-4 text-5xl font-bold font-headline text-foreground">
          Welcome to Theraia
        </h1>
        <p className="mt-4 text-lg text-muted-foreground font-body">
          Your safe and confidential space to talk, reflect, and grow. Our AI
          therapist is here to listen without judgment, whenever you need it.
        </p>
        <div className="mt-10">
          <Link href="/session" passHref>
            <Button size="lg" className="font-bold text-lg">
              <Play className="mr-2 h-6 w-6" />
              Start Session
            </Button>
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 text-left md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center">
                <Lock className="mr-2 h-5 w-5" />
                Private & Secure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="font-body">
                Your session history is encrypted and stored on your device, not our servers. You are in complete control of your data.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Context-Aware</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="font-body">
                Bring your encrypted record back to pick up where you left off, ensuring continuous and personalized support.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
