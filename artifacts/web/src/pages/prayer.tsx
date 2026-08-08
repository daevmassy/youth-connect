import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useListPrayers, useCreatePrayer, useTogglePray, getListPrayersQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Heart, Send } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function PrayerWall() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data, isLoading } = useListPrayers();
  const createPrayer = useCreatePrayer();
  const togglePray = useTogglePray();

  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createPrayer.mutate(
      { data: { content, isAnonymous } },
      {
        onSuccess: () => {
          setContent('');
          queryClient.invalidateQueries({ queryKey: getListPrayersQueryKey() });
          toast({ description: "Prayer request posted." });
        }
      }
    );
  };

  const handleTogglePray = (id: number, currentHasPrayed: boolean) => {
    // Optimistic update locally
    queryClient.setQueryData(getListPrayersQueryKey(), (old: any) => {
      if (!old) return old;
      return {
        ...old,
        prayers: old.prayers.map((p: any) => 
          p.id === id 
            ? { ...p, hasPrayed: !currentHasPrayed, prayCount: p.prayCount + (currentHasPrayed ? -1 : 1) } 
            : p
        )
      };
    });

    togglePray.mutate({ id });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-serif text-primary">Prayer Wall</h1>
        <p className="text-muted-foreground">Bear one another's burdens.</p>
      </div>

      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Share your prayer request..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none bg-background text-base"
            />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="anonymous" 
                  checked={isAnonymous} 
                  onCheckedChange={setIsAnonymous} 
                />
                <Label htmlFor="anonymous" className="cursor-pointer text-sm font-medium">
                  Post anonymously
                </Label>
              </div>
              <Button type="submit" disabled={!content.trim() || createPrayer.isPending} className="gap-2">
                <Send className="w-4 h-4" />
                {createPrayer.isPending ? "Posting..." : "Post Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-32 bg-muted animate-pulse" />
          ))
        ) : data?.prayers?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No prayer requests yet. Be the first to share.
          </div>
        ) : (
          data?.prayers?.map((prayer) => (
            <Card key={prayer.id} className="transition-all hover:border-primary/30">
              <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                <div>
                  <p className="font-semibold text-primary">
                    {prayer.isAnonymous ? 'Anonymous' : prayer.author}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(prayer.createdAt)}</p>
                </div>
                {prayer.isOwn && (
                  <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground font-medium">Your request</span>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-foreground/90 whitespace-pre-wrap">{prayer.content}</p>
              </CardContent>
              <CardFooter className="pt-0 pb-4">
                <Button
                  variant={prayer.hasPrayed ? "secondary" : "outline"}
                  size="sm"
                  className={cn("gap-2 rounded-full", prayer.hasPrayed && "bg-secondary/20 hover:bg-secondary/30 text-secondary-foreground border-transparent")}
                  onClick={() => handleTogglePray(prayer.id, prayer.hasPrayed)}
                >
                  <Heart className={cn("w-4 h-4", prayer.hasPrayed ? "fill-secondary text-secondary" : "")} />
                  {prayer.hasPrayed ? "Praying" : "Pray"} 
                  {prayer.prayCount > 0 && <span className="ml-1 opacity-70">({prayer.prayCount})</span>}
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
