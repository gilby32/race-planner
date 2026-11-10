import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import Constants from 'expo-constants';

const API_PORT = 4000;

/**
 * Resolves the backend URL:
 * 1. EXPO_PUBLIC_API_URL if it is set.
 * 2. Otherwise, the IP of the computer serving Expo (works in Expo Go on the same Wi-Fi).
 * 3. As a last resort, localhost (iOS simulator / web).
 */
function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;

  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host) return `http://${host}:${API_PORT}/graphql`;

  return `http://localhost:${API_PORT}/graphql`;
}

export const API_URL = resolveApiUrl();

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: API_URL }),
  cache: new InMemoryCache(),
});
