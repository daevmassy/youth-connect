import { useAppContext } from '@/context/AppContext';
import { formatTime } from '@/lib/format';
import { Play, Pause, SkipBack, SkipForward, Music } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export default function MusicPage() {
  const { 
    tracks, 
    currentTrack, 
    isPlaying, 
    togglePlayPause, 
    currentTime, 
    playNext, 
    playPrev,
    setCurrentTrack,
    seekTo,
    playbackError,
  } = useAppContext();

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-serif text-primary">Worship</h1>
        <p className="text-muted-foreground">Sing to the Lord a new song.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Player Column */}
        <div className="flex flex-col items-center p-6 bg-card border rounded-3xl shadow-sm">
          <div className="w-full aspect-square max-w-[280px] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl mb-8 flex items-center justify-center shadow-inner relative overflow-hidden">
            <div className={cn("absolute inset-0 bg-primary/5 transition-opacity duration-1000", isPlaying ? "opacity-100" : "opacity-0")} />
            <Music className="w-24 h-24 text-primary/40" />
          </div>
          
          <div className="w-full text-center mb-6">
            <h2 className="text-2xl font-bold truncate px-4">
              {currentTrack?.title || 'Select a song'}
            </h2>
            <p className="text-muted-foreground text-sm mt-1 truncate">
              {currentTrack?.artist || '...'}
            </p>
            {playbackError && <p className="text-sm text-destructive mt-3">{playbackError}</p>}
          </div>

          <div className="w-full space-y-3 mb-8">
            <Slider
              value={[currentTime]}
              max={currentTrack?.duration || 100}
              step={1}
              onValueChange={(val) => seekTo(val[0])}
              disabled={!currentTrack}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>{formatTime(currentTime)}</span>
              <span>{currentTrack ? formatTime(currentTrack.duration) : '--:--'}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 w-full">
            <button 
              onClick={playPrev}
              disabled={!currentTrack}
              className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-muted transition-colors disabled:opacity-50"
            >
              <SkipBack className="w-6 h-6" />
            </button>
            
            <button 
              onClick={togglePlayPause}
              className="w-16 h-16 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95 shadow-md"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current ml-1" />
              )}
            </button>
            
            <button 
              onClick={playNext}
              disabled={!currentTrack}
              className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-muted transition-colors disabled:opacity-50"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Playlist Column */}
        <div className="bg-card border rounded-3xl p-2 md:p-4 h-full flex flex-col">
          <h3 className="px-4 py-3 font-semibold text-lg border-b">Hymns & Favorites</h3>
          <div className="overflow-y-auto flex-1 py-2">
            {tracks.length === 0 && (
              <p className="px-4 py-8 text-sm text-muted-foreground text-center">
                Worship music is being prepared. Check back soon.
              </p>
            )}
            {tracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => setCurrentTrack(track)}
                  className={cn(
                    "w-full flex items-center gap-4 p-3 rounded-xl transition-colors text-left group",
                    isCurrent ? "bg-primary/10" : "hover:bg-muted"
                  )}
                >
                  <div className="w-8 h-8 flex items-center justify-center text-sm font-medium text-muted-foreground">
                    {isCurrent && isPlaying ? (
                      <div className="flex items-end justify-center gap-[2px] h-4 w-4">
                        <div className="w-[3px] bg-primary animate-[bounce_1s_infinite] h-2" />
                        <div className="w-[3px] bg-primary animate-[bounce_1s_infinite_0.2s] h-4" />
                        <div className="w-[3px] bg-primary animate-[bounce_1s_infinite_0.4s] h-3" />
                      </div>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <p className={cn("font-medium truncate", isCurrent && "text-primary")}>{track.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(track.duration)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
