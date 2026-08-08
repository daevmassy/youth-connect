import { useListEvents, useCreateEvent, getListEventsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  title: z.string().min(1, 'Required'),
  description: z.string().optional(),
  location: z.string().optional(),
  startsAt: z.string().min(1, 'Required'), // Will use a datetime-local input
});

export default function AdminEvents() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data } = useListEvents();
  const create = useCreateEvent();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '', description: '', location: '', startsAt: ''
    }
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    // Convert local datetime to ISO string for backend
    const isoDate = new Date(values.startsAt).toISOString();
    
    create.mutate({ data: { ...values, startsAt: isoDate } }, {
      onSuccess: () => {
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
        toast({ description: "Event created." });
      }
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Manage Events</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create Event</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field}/></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="startsAt" render={({ field }) => (
                  <FormItem><FormLabel>Start Date & Time</FormLabel><FormControl><Input type="datetime-local" {...field}/></FormControl><FormMessage/></FormItem>
                )}/>
              </div>
              <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field}/></FormControl><FormMessage/></FormItem>
              )}/>
              <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field}/></FormControl><FormMessage/></FormItem>
              )}/>
              <Button type="submit" disabled={create.isPending}>Create Event</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold mt-8">Scheduled Events</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {data?.events?.map(e => (
            <Card key={e.id}>
              <CardContent className="p-4">
                <p className="font-bold">{e.title}</p>
                <p className="text-sm text-muted-foreground">{formatDate(e.startsAt)}</p>
                <p className="text-sm mt-2">{e.location}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
