import { useListReadingPlans, useGetReadingProgress, useCompleteReadingDay, getGetReadingProgressQueryKey } from '@workspace/api-client-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookMarked, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default function ReadingPlans() {
  const queryClient = useQueryClient();
  const [openDayId, setOpenDayId] = useState<number | null>(null);
  const [openedDayIds, setOpenedDayIds] = useState<Set<number>>(new Set());
  const { data: plansData, isLoading: plansLoading } = useListReadingPlans();
  const { data: progressData, isLoading: progressLoading } = useGetReadingProgress();
  const completeDay = useCompleteReadingDay();

  const plans = plansData?.plans || [];
  const completedDayIds = new Set(progressData?.progress?.filter(p => p.completed).map(p => p.planDayId) || []);

  const handleComplete = (dayId: number) => {
    completeDay.mutate(
      { dayId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetReadingProgressQueryKey() });
        }
      }
    );
  };

  const handleOpenVerse = (dayId: number) => {
    setOpenDayId((current) => (current === dayId ? null : dayId));
    if (!completedDayIds.has(dayId) && !openedDayIds.has(dayId)) {
      setOpenedDayIds((current) => new Set(current).add(dayId));
      handleComplete(dayId);
    }
  };

  if (plansLoading || progressLoading) {
    return (
      <div className="p-4 max-w-4xl mx-auto space-y-4">
        <div className="h-48 bg-muted animate-pulse rounded-xl" />
        <div className="h-48 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-serif text-primary">Reading Plans</h1>
        <p className="text-muted-foreground">Journey through the Word together.</p>
      </div>

      <div className="space-y-8">
        {plans.map(plan => {
          const totalDays = plan.days.length;
           const completedCount = plan.days.filter(d => completedDayIds.has(d.id) || openedDayIds.has(d.id)).length;
          const progressPercent = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

          return (
            <Card key={plan.id} className="overflow-hidden border-border">
              <CardHeader className="bg-primary/5 pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="bg-primary/10 text-primary p-2 rounded-lg">
                    <BookMarked className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-primary">{progressPercent}%</span>
                </div>
                <CardTitle className="text-2xl font-serif">{plan.title}</CardTitle>
                {plan.description && <CardDescription className="text-base">{plan.description}</CardDescription>}
                
                <div className="mt-4 pt-2">
                  <Progress value={progressPercent} className="h-2 bg-primary/10" />
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="divide-y">
                   {[...plan.days].sort((a, b) => a.dayNumber - b.dayNumber).map(day => {
                     const isComplete = completedDayIds.has(day.id) || openedDayIds.has(day.id);
                     const isOpen = openDayId === day.id;
                    return (
                       <div key={day.id} className={cn("p-4 hover:bg-muted/30 transition-colors", isOpen && "bg-primary/5")}>
                         <div
                           role="button"
                           tabIndex={0}
                           onClick={() => handleOpenVerse(day.id)}
                           onKeyDown={(event) => {
                             if (event.key === 'Enter' || event.key === ' ') handleOpenVerse(day.id);
                           }}
                           className="flex items-center justify-between cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary"
                         >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2",
                            isComplete 
                              ? "bg-secondary text-secondary-foreground border-secondary" 
                              : "bg-background text-muted-foreground border-border"
                          )}>
                            {day.dayNumber}
                          </div>
                          <div>
                            <p className={cn("font-medium text-base", isComplete && "line-through text-muted-foreground")}>
                              {day.passage}
                            </p>
                            {day.reflection && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{day.reflection}</p>
                            )}
                          </div>
                        </div>
                         {isComplete ? <CheckCircle2 className="w-6 h-6 text-secondary shrink-0" /> : <Circle className="w-6 h-6 text-muted-foreground shrink-0" />}
                         </div>
                         {isOpen && (
                           <div className="ml-14 mt-3 rounded-xl border border-primary/15 bg-background p-4 space-y-2">
                             <p className="text-sm font-semibold text-primary">Verse opened</p>
                             <p className="text-sm leading-6">{day.passage}</p>
                             {day.reflection && <p className="text-sm text-muted-foreground leading-6">{day.reflection}</p>}
                             <p className="text-xs font-medium text-secondary">
                               {completeDay.isPending && !completedDayIds.has(day.id) ? 'Saving your read status…' : 'Marked as read'}
                             </p>
                           </div>
                         )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {plans.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No reading plans available.
          </div>
        )}
      </div>
    </div>
  );
}
