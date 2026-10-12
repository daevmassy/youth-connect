import { Navigation } from './navigation';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-background md:pl-64 flex flex-col">
      <Navigation />
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}
