import { useListEvents, useToggleRsvp, getListEventsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function Events() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useListEvents();
  const toggleRsvp = useToggleRsvp();

  const events = data?.events || [];

  const handleRsvp = (id: number, currentStatus: boolean) => {
    // Optimistic update
    queryClient.setQueryData(getListEventsQueryKey(), (old: any) => {
      if (!old) return old;
      return {
        ...old,
        events: old.events.map((e: any) => 
          e.id === id ? { ...e, isRsvped: !currentStatus } : e
        )
      };
    });

    toggleRsvp.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-serif text-primary">Events</h1>
        <p className="text-muted-foreground">Gather together in fellowship.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {events.map((event) => {
          const date = new Date(event.startsAt);
          const isPast = date < new Date();
          
          return (
            <Card key={event.id} className={cn("flex flex-col", isPast && "opacity-60")}>
              <CardHeader className="pb-4 border-b border-border/50">
                <div className="flex justify-between items-start mb-2">
                  <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-center flex-shrink-0 min-w-[60px]">
                    <p className="text-xs font-bold uppercase">{date.toLocaleString('default', { month: 'short' })}</p>
                    <p className="text-xl font-bold leading-none mt-1">{date.getDate()}</p>
                  </div>
                  {event.isRsvped && (
                    <span className="text-xs font-bold bg-secondary/20 text-secondary-foreground px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Going
                    </span>
                  )}
                </div>
                <CardTitle className="text-xl font-serif mt-2 line-clamp-1">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="py-4 flex-1 space-y-3">
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary/60" />
                    <span>{date.toLocaleTimeString('default', { hour: 'numeric', minute: '2-digit' })}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary/60" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>
                {event.description && (
                  <p className="text-sm mt-3 line-clamp-2">{event.description}</p>
                )}
              </CardContent>
              <CardFooter className="pt-0 pb-4">
                <Button 
                  className={cn("w-full transition-all", event.isRsvped ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" : "")} 
                  variant={event.isRsvped ? "default" : "outline"}
                  onClick={() => handleRsvp(event.id, event.isRsvped)}
                  disabled={isPast || toggleRsvp.isPending}
                >
                  {isPast ? "Event Ended" : event.isRsvped ? "Cancel RSVP" : "RSVP Now"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}

        {events.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No events scheduled at the moment.
          </div>
        )}
      </div>
    </div>
  );
}

// Missing icon import hack
function CheckCircle2(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>;
}
