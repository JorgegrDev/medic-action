interface NetworkError {
  code: string;
  message: string;
  details: string;
}

export function handleNetworkError(error: any): NetworkError {
  console.error('Network Error:', error);
  
  if (error instanceof TypeError && error.message === 'Network request failed') {
    return {
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to the server. Please check your internet connection.',
      details: error.message
    };
  }

  if (error.code?.startsWith('auth/')) {
    return {
      code: 'AUTH_ERROR',
      message: getAuthErrorMessage(error.code),
      details: error.message
    };
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    details: error.message || String(error)
  };
}

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
      return 'Authentication failed. Please try again.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    default:
      return 'Authentication error occurred. Please try again.';
  }
}