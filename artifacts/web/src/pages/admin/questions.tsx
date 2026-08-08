import { useState } from 'react';
import { useListAllQuestions, useAnswerQuestion, getListAllQuestionsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/format';

export default function AdminQuestions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data } = useListAllQuestions();
  const answerQ = useAnswerQuestion();

  const [drafts, setDrafts] = useState<Record<number, string>>({});

  const handleAnswer = (id: number) => {
    const answer = drafts[id];
    if (!answer?.trim()) return;

    answerQ.mutate({ id, data: { answer } }, {
      onSuccess: () => {
        setDrafts(prev => ({ ...prev, [id]: '' }));
        queryClient.invalidateQueries({ queryKey: getListAllQuestionsQueryKey() });
        toast({ description: "Answer submitted." });
      }
    });
  };

  const questions = data?.questions || [];
  const pending = questions.filter(q => !q.answer);
  const answered = questions.filter(q => !!q.answer);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Pastoral Q&A</h1>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-destructive">Needs Answer ({pending.length})</h2>
        {pending.length === 0 && <p className="text-muted-foreground">All caught up!</p>}
        {pending.map(q => (
          <Card key={q.id} className="border-border shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">Ticket: {q.ticketCode}</span>
                <span className="text-xs text-muted-foreground">{formatDate(q.createdAt)}</span>
              </div>
              <p className="font-medium text-lg">"{q.content}"</p>
              <div className="space-y-2">
                <Textarea 
                  placeholder="Draft your pastoral response..."
                  value={drafts[q.id] || ''}
                  onChange={(e) => setDrafts(prev => ({ ...prev, [q.id]: e.target.value }))}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleAnswer(q.id)}
                    disabled={!drafts[q.id]?.trim() || answerQ.isPending}
                  >
                    Send Answer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6 pt-8 border-t">
        <h2 className="text-xl font-bold text-muted-foreground">Answered ({answered.length})</h2>
        {answered.map(q => (
          <Card key={q.id} className="opacity-70">
            <CardContent className="p-4 space-y-3">
              <p className="font-medium italic">Q: {q.content}</p>
              <div className="bg-muted p-3 rounded text-sm">
                <span className="font-bold block mb-1">Answer:</span>
                {q.answer}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
