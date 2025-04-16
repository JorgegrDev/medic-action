import * as Google from 'expo-auth-session/providers/google';
import { maybeCompleteAuthSession } from 'expo-web-browser';
import { Platform } from 'react-native';

// Attempt to complete auth session when the app loads
maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '892453499923-1h0m9b0kcn1u2c04tq470i4e5h9gsfd6.apps.googleusercontent.com',
    webClientId: '892453499923-1h0m9b0kcn1u2c04tq470i4e5h9gsfd6.apps.googleusercontent.com',
  });

  return {
    request,
    response,
    promptAsync
  };
}