import { useAuth } from '@/context/AuthContext';
import { useDevotionalStreak } from '@/hooks/use-streak';
import { useListDevotionals } from '@workspace/api-client-react';
import type { Devotional } from '@workspace/api-client-react';
import { useState } from 'react';
import { formatDate } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronLeft, CheckCircle2, Flame } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function Devotion() {
  const { user } = useAuth();
  const { streak, updateStreak } = useDevotionalStreak(user?.id);
  const { data, isLoading } = useListDevotionals();
  const [selectedDevotional, setSelectedDevotional] = useState<Devotional | null>(null);

  const handleRead = () => {
    updateStreak();
    setSelectedDevotional(null);
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-xl" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  const devotionals = data?.devotionals || [];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      <div className="flex items-center justify-between bg-card border rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif text-primary mb-2">Daily Devotions</h1>
          <p className="text-muted-foreground">Find peace and purpose in His word.</p>
        </div>
        <div className="flex flex-col items-center text-secondary bg-secondary/10 px-6 py-3 rounded-xl border border-secondary/20">
          <Flame className="w-8 h-8 mb-1" />
          <span className="text-2xl font-bold leading-none">{streak}</span>
          <span className="text-xs uppercase tracking-wider font-bold mt-1">Day Streak</span>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6">
        {devotionals.map((devotional) => (
          <Card 
            key={devotional.id} 
            className="cursor-pointer hover-elevate transition-all border-border hover:border-primary/30"
            onClick={() => setSelectedDevotional(devotional)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {formatDate(devotional.publishDate)}
                </span>
                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> Reading
                </span>
              </div>
              <CardTitle className="text-xl md:text-2xl font-serif">{devotional.title}</CardTitle>
              <CardDescription className="text-secondary font-medium text-base">
                {devotional.scriptureRef}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-2 md:line-clamp-3">
                {devotional.body}
              </p>
            </CardContent>
          </Card>
        ))}

        {devotionals.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No devotionals available yet.
          </div>
        )}
      </div>

      <Dialog open={!!selectedDevotional} onOpenChange={(open) => !open && setSelectedDevotional(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedDevotional && (
            <div className="space-y-6 py-4">
              <DialogHeader>
                <div className="mb-4">
                  <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {formatDate(selectedDevotional.publishDate)}
                  </span>
                </div>
                <DialogTitle className="text-3xl font-serif text-primary leading-tight">
                  {selectedDevotional.title}
                </DialogTitle>
                <DialogDescription className="text-lg text-secondary font-medium pt-2">
                  {selectedDevotional.scriptureRef}
                </DialogDescription>
              </DialogHeader>
              
              <div className="bg-muted/30 p-6 rounded-xl border-l-4 border-secondary italic text-lg text-foreground/80 font-serif">
                "{selectedDevotional.scriptureText}"
              </div>

              <div className="prose dark:prose-invert prose-p:leading-relaxed text-foreground/90 pb-6">
                {selectedDevotional.body.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))}
              </div>

              <div className="pt-6 border-t flex justify-end">
                <Button size="lg" onClick={handleRead} className="gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Mark as Read
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
