import { Link, useLocation } from 'wouter';
import { Home, BookOpen, Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

export function Navigation() {
  const [location] = useLocation();
  const { currentTrack, isPlaying, togglePlayPause } = useAppContext();
  const { user } = useAuth();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/devotion', label: 'Devotion', icon: BookOpen },
    { href: '/prayer', label: 'Prayer', icon: Heart },
    { href: '/community', label: 'Community', icon: MessageCircle },
    { href: '/more', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-40">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight text-sidebar-primary">Youth Connect</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}>
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {currentTrack && (
          <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/20">
            <div className="flex items-center justify-between">
              <div className="truncate pr-2">
                <p className="text-sm font-medium truncate">{currentTrack.title}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">{currentTrack.artist}</p>
              </div>
              <button 
                onClick={togglePlayPause}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex-shrink-0"
              >
                {isPlaying ? (
                  <div className="w-3 h-3 flex gap-1"><div className="w-1 bg-current h-full"/><div className="w-1 bg-current h-full"/></div>
                ) : (
                  <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-current border-b-4 border-b-transparent ml-1" />
                )}
              </button>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-sidebar-border">
          <Link href="/profile" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary group-hover:bg-sidebar-primary/30 transition-colors">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">@{user?.username}</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card border-t border-border z-40 pb-safe">
        {currentTrack && (
          <div className="px-4 py-2 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="truncate pr-2 flex-1">
              <p className="text-xs font-medium truncate">{currentTrack.title}</p>
              <p className="text-[10px] text-muted-foreground truncate">{currentTrack.artist}</p>
            </div>
            <button 
              onClick={togglePlayPause}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0"
            >
              {isPlaying ? (
                <div className="w-2.5 h-2.5 flex gap-0.5"><div className="w-1 bg-current h-full"/><div className="w-1 bg-current h-full"/></div>
              ) : (
                <div className="w-0 h-0 border-t-3 border-t-transparent border-l-5 border-l-current border-b-3 border-b-transparent ml-0.5" />
              )}
            </button>
          </div>
        )}
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                <item.icon className={cn("w-5 h-5", isActive && "fill-primary/20")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
