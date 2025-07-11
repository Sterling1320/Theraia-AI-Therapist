import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bot, Play } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="max-w-2xl text-center">
        <Bot className="mx-auto h-24 w-24 text-primary" />
        <h1 className="mt-4 text-5xl font-bold font-headline text-foreground">
          Welcome to TheraFlow
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
              <CardTitle className="font-headline">Always Available</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="font-body">
                TheraFlow is here for you 24/7. Access support whenever you feel
                the need to talk.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Context-Aware</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="font-body">
                Our AI remembers your previous sessions to provide continuous
                and personalized support.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
