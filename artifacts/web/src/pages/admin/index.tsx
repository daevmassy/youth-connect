import { useAppContext } from '@/context/AppContext';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, FileText, Calendar, MessageSquareQuote, Music2, BookOpen } from 'lucide-react';

export default function AdminIndex() {
  const { isAdmin } = useAppContext();

  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle>Admin Login Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 text-center">Use the private admin entry on the login screen to continue.</p>
            <Button asChild className="w-full"><Link href="/admin-login">Open admin login</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sections = [
    { href: '/admin/devotions', label: 'Manage Devotionals', icon: FileText, desc: 'Create and delete daily readings' },
    { href: '/admin/events', label: 'Manage Events', icon: Calendar, desc: 'Schedule new youth gatherings' },
    { href: '/admin/questions', label: 'Answer Questions', icon: MessageSquareQuote, desc: 'Respond to anonymous user questions' },
    { href: '/admin/music', label: 'Manage Music', icon: Music2, desc: 'Upload worship music and audio files' },
    { href: '/admin/study-guides', label: 'Study Guides', icon: BookOpen, desc: 'Create reading plans and verse guides' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif text-primary">Admin Dashboard</h1>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map(section => (
          <Card key={section.href} className="hover-elevate border-border">
            <CardContent className="p-6">
              <section.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">{section.label}</h3>
              <p className="text-sm text-muted-foreground mb-4">{section.desc}</p>
              <Button asChild variant="outline" className="w-full">
                <Link href={section.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
