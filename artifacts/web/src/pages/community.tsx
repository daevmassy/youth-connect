import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAppContext } from '@/context/AppContext';
import { 
  useListChatMessages, 
  useSendChatMessage, 
  useListMyQuestions, 
  useSubmitQuestion,
  getListChatMessagesQueryKey,
  getListMyQuestionsQueryKey,
  type ChatRoom as ChatRoomType
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, User as UserIcon, UserCircle, MessageSquareQuote } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function Community() {
  const { user } = useAuth();
  const { anonAlias } = useAppContext();
  const [activeTab, setActiveTab] = useState('friends');
  
  return (
    <div className="h-[100dvh] md:h-screen flex flex-col md:p-6 max-w-5xl mx-auto pt-safe">
      <div className="px-4 py-4 md:px-0 flex-shrink-0">
        <h1 className="text-2xl font-serif text-primary">Community</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-4 md:px-0 flex-shrink-0">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="friends" className="gap-2">
              <UserIcon className="w-4 h-4 hidden sm:block" /> Friends
            </TabsTrigger>
            <TabsTrigger value="anonymous" className="gap-2">
              <UserCircle className="w-4 h-4 hidden sm:block" /> Anonymous
            </TabsTrigger>
            <TabsTrigger value="pastor" className="gap-2">
              <MessageSquareQuote className="w-4 h-4 hidden sm:block" /> Ask Pastor
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0 relative mt-4">
          <TabsContent value="friends" className="absolute inset-0 mt-0 data-[state=active]:flex flex-col">
            <ChatRoom room="friends" displayName={user?.firstName || 'Friend'} userId={user?.id || 0} />
          </TabsContent>
          <TabsContent value="anonymous" className="absolute inset-0 mt-0 data-[state=active]:flex flex-col">
            <ChatRoom room="anonymous" displayName={anonAlias} userId={user?.id || 0} />
          </TabsContent>
          <TabsContent value="pastor" className="absolute inset-0 mt-0 data-[state=active]:flex flex-col">
            <AskPastor />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function ChatRoom({ room, displayName, userId }: { room: ChatRoomType, displayName: string, userId: number }) {
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useListChatMessages(room, {
    query: { queryKey: getListChatMessagesQueryKey(room) },
  });
  const sendMsg = useSendChatMessage();

  const messages = (data?.messages || []).filter(m => m.room === room).reverse();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMsg.mutate(
      { room, data: { content: message, displayName } },
      {
        onSuccess: () => {
          setMessage('');
          queryClient.invalidateQueries({ queryKey: getListChatMessagesQueryKey(room) });
        }
      }
    );
  };

  return (
    <Card className="flex-1 flex flex-col h-full rounded-none border-x-0 md:rounded-xl md:border-x shadow-none md:shadow-sm overflow-hidden bg-card">
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {isLoading ? (
          <div className="flex justify-center p-4 text-muted-foreground"><div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"/></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground h-full flex items-center justify-center">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.userId === userId;
            return (
              <div key={msg.id} className={cn("flex flex-col max-w-[80%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                <span className="text-[10px] text-muted-foreground mb-1 px-1">{msg.displayName}</span>
                <div className={cn(
                  "px-4 py-2 rounded-2xl text-sm",
                  isMe ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"
                )}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="p-3 border-t bg-card mt-auto flex-shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-muted/50 border-transparent focus-visible:ring-1"
          />
          <Button type="submit" size="icon" disabled={!message.trim() || sendMsg.isPending} className="rounded-full flex-shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}

function AskPastor() {
  const [question, setQuestion] = useState('');
  const queryClient = useQueryClient();
  const { data, isLoading } = useListMyQuestions();
  const submitQ = useSubmitQuestion();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    submitQ.mutate(
      { data: { content: question } },
      {
        onSuccess: () => {
          setQuestion('');
          queryClient.invalidateQueries({ queryKey: getListMyQuestionsQueryKey() });
        }
      }
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-0 md:pt-4 space-y-6">
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 md:p-6">
          <h2 className="font-serif text-lg text-primary mb-2">Ask a Question</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Have a question about faith, the Bible, or life? Ask here. Only the pastoral team will see who asked.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What's on your mind?"
              className="resize-none bg-background"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!question.trim() || submitQ.isPending}>
                Submit Question
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Your Questions</h3>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-muted rounded-xl"></div>
          </div>
        ) : data?.questions?.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">You haven't asked any questions yet.</p>
        ) : (
          data?.questions?.map((q) => (
            <Card key={q.id} className="overflow-hidden">
              <div className="p-4 bg-muted/30">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-muted-foreground bg-background px-2 py-1 rounded">Ticket: {q.ticketCode}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(q.createdAt)}</span>
                </div>
                <p className="font-medium text-sm">{q.content}</p>
              </div>
              {q.answer ? (
                <div className="p-4 border-t border-secondary/20 bg-secondary/5">
                  <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Pastoral Response</p>
                  <p className="text-sm">{q.answer}</p>
                </div>
              ) : (
                <div className="p-3 border-t bg-card text-xs text-muted-foreground flex items-center justify-center italic">
                  Awaiting response...
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
