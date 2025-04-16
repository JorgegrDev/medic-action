import { GoogleSignin } from '@react-native-google-signin/google-signin';
import NetInfo from '@react-native-community/netinfo';

const TIMEOUT = 15000; // 15 seconds

export const configureGoogleAuth = () => {
  GoogleSignin.configure({
    androidClientId: '892453499923-1h0m9b0kcn1u2c04tq470i4e5h9gsfd6.apps.googleusercontent.com',
    webClientId: '892453499923-n3lvarc36s5676gc8ovl5t52r3mp8dbf.apps.googleusercontent.com',
    offlineAccess: true,
    scopes: ['profile', 'email']
  });
};

export const signInWithGoogle = async () => {
  try {
    // Check network connectivity first
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      throw new Error('No internet connection');
    }

    // Add timeout to the sign-in process
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), TIMEOUT);
    });

    const signInPromise = GoogleSignin.signIn();
    const response = await Promise.race([signInPromise, timeoutPromise]);

    return response;
  } catch (error: any) {
    if (error.message === 'Request timeout') {
      throw new Error('The request timed out. Please try again.');
    }
    if (error.message === 'No internet connection') {
      throw new Error('Please check your internet connection and try again.');
    }
    throw error;
  }
};