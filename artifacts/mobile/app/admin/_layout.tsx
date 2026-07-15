import React, { useEffect } from 'react';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { router, Stack } from 'expo-router';

export default function AdminLayout() {
  const colors = useColors();
  const { isAdmin } = useApp();

  useEffect(() => {
    if (!isAdmin) {
      // Redirect non-admin users back to home immediately
      router.replace('/');
    }
  }, [isAdmin]);

  // Render nothing while redirecting
  if (!isAdmin) return null;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontFamily: 'Inter_700Bold', fontSize: 17 },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Admin Panel' }} />
      <Stack.Screen name="questions" options={{ title: 'Questions Queue' }} />
      <Stack.Screen name="devotions" options={{ title: 'Devotions' }} />
      <Stack.Screen name="events" options={{ title: 'Events' }} />
    </Stack>
  );
}
