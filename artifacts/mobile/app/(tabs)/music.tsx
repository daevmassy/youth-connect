import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { type GospelTrack, formatDuration } from '@/data/mockData';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PLAYLISTS = ['Ruwa Worship', 'Quiet Time'];

export default function MusicScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tracks, currentTrack, isPlaying, playTrack, pauseTrack } = useApp();
  const [selectedPlaylist, setSelectedPlaylist] = useState('Ruwa Worship');
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  const filtered = tracks.filter(tr => tr.playlistCategory === selectedPlaylist);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#065F46', '#059669']}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={styles.headerTitle}>Gospel Music</Text>
        <Text style={[styles.headerSub, { color: 'rgba(255,255,255,0.7)' }]}>
          Admin curated — worship anywhere
        </Text>

        {/* Playlist tabs */}
        <View style={[styles.playlistTabs, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          {PLAYLISTS.map(pl => (
            <Pressable
              key={pl}
              onPress={() => setSelectedPlaylist(pl)}
              style={[styles.playlistTab, selectedPlaylist === pl && { backgroundColor: '#fff' }]}
            >
              <Text style={[
                styles.playlistTabText,
                { color: selectedPlaylist === pl ? '#065F46' : 'rgba(255,255,255,0.85)' },
              ]}>
                {pl}
              </Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: currentTrack ? 160 : 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="music" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No tracks yet. Admin will add music soon.
            </Text>
          </View>
        ) : (
          filtered.map((track, index) => (
            <TrackRow
              key={track.id}
              track={track}
              index={index + 1}
              isPlaying={isPlaying && currentTrack?.id === track.id}
              isCurrent={currentTrack?.id === track.id}
              onPlay={() => {
                if (currentTrack?.id === track.id) {
                  pauseTrack();
                } else {
                  playTrack(track);
                }
              }}
              colors={colors}
            />
          ))
        )}
      </ScrollView>

      {/* Mini Player */}
      {currentTrack && (
        <MiniPlayer
          track={currentTrack}
          isPlaying={isPlaying}
          onToggle={pauseTrack}
          colors={colors}
          insets={insets}
        />
      )}
    </View>
  );
}

function TrackRow({ track, index, isPlaying, isCurrent, onPlay, colors }: {
  track: GospelTrack;
  index: number;
  isPlaying: boolean;
  isCurrent: boolean;
  onPlay: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isPlaying) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying]);

  return (
    <Pressable
      onPress={onPlay}
      style={({ pressed }) => [
        styles.trackRow,
        {
          backgroundColor: isCurrent ? colors.successLight as string : colors.card,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      <View style={[styles.trackNum, { backgroundColor: isCurrent ? '#059669' : colors.secondary }]}>
        {isPlaying ? (
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <MaterialIcons name="graphic-eq" size={18} color="#fff" />
          </Animated.View>
        ) : (
          <Text style={[styles.trackNumText, { color: isCurrent ? '#fff' : colors.mutedForeground }]}>
            {index}
          </Text>
        )}
      </View>
      <View style={styles.trackInfo}>
        <Text style={[styles.trackTitle, { color: isCurrent ? '#065F46' : colors.foreground }]} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={[styles.trackArtist, { color: colors.mutedForeground }]} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>
      {track.lyrics ? (
        <View style={[styles.lyricsBadge, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.lyricsBadgeText, { color: colors.mutedForeground }]}>
            Lyrics
          </Text>
        </View>
      ) : null}
      <Text style={[styles.trackDuration, { color: colors.mutedForeground }]}>
        {formatDuration(track.durationSeconds)}
      </Text>
      <Pressable onPress={onPlay} style={[styles.playIconBtn, { backgroundColor: isCurrent ? '#059669' : colors.primary }]}>
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={16} color="#fff" />
      </Pressable>
    </Pressable>
  );
}

function MiniPlayer({ track, isPlaying, onToggle, colors, insets }: {
  track: GospelTrack;
  isPlaying: boolean;
  onToggle: () => void;
  colors: ReturnType<typeof useColors>;
  insets: { bottom: number };
}) {
  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 84 : 0);

  return (
    <View style={[styles.miniPlayer, { backgroundColor: colors.primary, paddingBottom: bottomPad + 12 }]}>
      <View style={[styles.miniPlayerIcon, { backgroundColor: '#059669' }]}>
        <Feather name="music" size={18} color="#fff" />
      </View>
      <View style={styles.miniPlayerInfo}>
        <Text style={styles.miniPlayerTitle} numberOfLines={1}>{track.title}</Text>
        <Text style={styles.miniPlayerArtist} numberOfLines={1}>{track.artist}</Text>
      </View>
      <Pressable onPress={onToggle} style={styles.miniPlayerBtn}>
        <Ionicons name={isPlaying ? 'pause-circle' : 'play-circle'} size={38} color={colors.gold as string} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { color: '#fff', fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  headerSub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 16 },
  playlistTabs: { flexDirection: 'row', borderRadius: 12, padding: 3 },
  playlistTab: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 10 },
  playlistTabText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  list: { paddingHorizontal: 16, paddingTop: 14, gap: 10 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 14 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', maxWidth: 260, lineHeight: 22 },
  trackRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 12, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  trackNum: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  trackNumText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  trackInfo: { flex: 1 },
  trackTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  trackArtist: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  lyricsBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  lyricsBadgeText: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  trackDuration: { fontSize: 12, fontFamily: 'Inter_400Regular', minWidth: 36, textAlign: 'right' },
  playIconBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  miniPlayer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, gap: 12 },
  miniPlayerIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  miniPlayerInfo: { flex: 1 },
  miniPlayerTitle: { color: '#fff', fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  miniPlayerArtist: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'Inter_400Regular' },
  miniPlayerBtn: { flexShrink: 0 },
});
