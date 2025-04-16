import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const configureGoogleAuth = () => {
  GoogleSignin.configure({
    androidClientId: '892453499923-1h0m9b0kcn1u2c04tq470i4e5h9gsfd6.apps.googleusercontent.com',
    webClientId: '892453499923-1h0m9b0kcn1u2c04tq470i4e5h9gsfd6.apps.googleusercontent.com',
    offlineAccess: true,
    scopes: ['profile', 'email']
  });
};