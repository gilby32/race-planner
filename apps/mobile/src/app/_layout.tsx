import { ApolloProvider } from '@apollo/client/react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/theme';
import { apolloClient } from '@/lib/apollo';

export default function RootLayout() {
  return (
    <ApolloProvider client={apolloClient}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: colors.primary,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'My plans' }} />
        <Stack.Screen name="plan/[id]" options={{ title: 'Race plan' }} />
      </Stack>
    </ApolloProvider>
  );
}
