import { useState } from 'react';
import { useListDevotionals, useCreateDevotional, useDeleteDevotional, getListDevotionalsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  title: z.string().min(1, 'Required'),
  scriptureRef: z.string().min(1, 'Required'),
  scriptureText: z.string().min(1, 'Required'),
  body: z.string().min(1, 'Required'),
});

export default function AdminDevotions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data } = useListDevotionals();
  const create = useCreateDevotional();
  const remove = useDeleteDevotional();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '', scriptureRef: '', scriptureText: '', body: ''
    }
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    create.mutate({ data: values }, {
      onSuccess: () => {
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListDevotionalsQueryKey() });
        toast({ description: "Devotional created successfully." });
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Delete this devotional?')) return;
    remove.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDevotionalsQueryKey() });
        toast({ description: "Deleted." });
      }
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Manage Devotionals</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create New</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field}/></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="scriptureRef" render={({ field }) => (
                  <FormItem><FormLabel>Scripture Reference (e.g. John 3:16)</FormLabel><FormControl><Input {...field}/></FormControl><FormMessage/></FormItem>
                )}/>
              </div>
              <FormField control={form.control} name="scriptureText" render={({ field }) => (
                  <FormItem><FormLabel>Scripture Text</FormLabel><FormControl><Textarea {...field}/></FormControl><FormMessage/></FormItem>
              )}/>
              <FormField control={form.control} name="body" render={({ field }) => (
                  <FormItem><FormLabel>Devotional Body</FormLabel><FormControl><Textarea className="h-32" {...field}/></FormControl><FormMessage/></FormItem>
              )}/>
              <Button type="submit" disabled={create.isPending}>Submit</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold mt-8">Existing Devotionals</h2>
        {data?.devotionals?.map(d => (
          <Card key={d.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-bold">{d.title}</p>
                <p className="text-sm text-muted-foreground">{d.scriptureRef} • {formatDate(d.publishDate)}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(d.id)} disabled={remove.isPending}>
                <Trash2 className="w-4 h-4"/>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
