import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getListReadingPlansQueryKey, useCreateReadingPlan, useListReadingPlans } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type GuideDay = { passage: string; reflection: string };

export default function AdminStudyGuides() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data } = useListReadingPlans();
  const create = useCreateReadingPlan();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState<GuideDay[]>([{ passage: '', reflection: '' }]);

  const updateDay = (index: number, key: keyof GuideDay, value: string) => {
    setDays((current) => current.map((day, i) => i === index ? { ...day, [key]: value } : day));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const validDays = days.filter((day) => day.passage.trim());
    if (!title.trim() || !validDays.length) {
      toast({ title: 'Incomplete study guide', description: 'Add a title and at least one verse.', variant: 'destructive' });
      return;
    }
    create.mutate({
      data: {
        title: title.trim(),
        description: description.trim(),
        days: validDays.map((day, index) => ({ dayNumber: index + 1, passage: day.passage.trim(), reflection: day.reflection.trim() })),
      },
    }, {
      onSuccess: () => {
        setTitle('');
        setDescription('');
        setDays([{ passage: '', reflection: '' }]);
        queryClient.invalidateQueries({ queryKey: getListReadingPlansQueryKey() });
        toast({ description: 'Study guide created.' });
      },
      onError: () => toast({ title: 'Could not create study guide', description: 'Please try again.', variant: 'destructive' }),
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div><h1 className="text-2xl font-bold">Study Guides</h1><p className="text-muted-foreground mt-1">Build reading plans one verse at a time.</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Create a study guide</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-5">
            <Input placeholder="Guide title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="space-y-3">
              {days.map((day, index) => (
                <div key={index} className="rounded-xl border p-4 space-y-3">
                  <div className="flex items-center justify-between"><p className="font-semibold text-sm">Day {index + 1}</p>{days.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => setDays((current) => current.filter((_, i) => i !== index))}><Trash2 className="w-4 h-4 text-destructive" /></Button>}</div>
                  <Input placeholder="Verse or passage, e.g. John 3:16" value={day.passage} onChange={(e) => updateDay(index, 'passage', e.target.value)} />
                  <Textarea placeholder="Reflection or study note (optional)" value={day.reflection} onChange={(e) => updateDay(index, 'reflection', e.target.value)} />
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => setDays((current) => [...current, { passage: '', reflection: '' }])}><Plus className="w-4 h-4 mr-2" /> Add day</Button>
            </div>
            <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Creating…' : 'Create study guide'}</Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-3">
        <h2 className="text-xl font-bold">Existing guides</h2>
        {data?.plans?.length ? data.plans.map((plan) => <Card key={plan.id}><CardContent className="p-4"><p className="font-semibold">{plan.title}</p><p className="text-sm text-muted-foreground">{plan.days.length} day{plan.days.length === 1 ? '' : 's'}{plan.description ? ` · ${plan.description}` : ''}</p></CardContent></Card>) : <p className="text-sm text-muted-foreground py-6">No study guides yet.</p>}
      </div>
    </div>
  );
}