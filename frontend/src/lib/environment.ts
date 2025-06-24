// Environment detection and URL utilities

export const getEnvironment = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' ? 'development' : 'production';
  }
  return process.env.NODE_ENV || 'development';
};

export const getSiteUrl = () => {
  // Prioritize environment variable
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // Fallback to dynamic detection
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server-side fallback
  return 'http://localhost:3000';
};

export const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

export const getCallbackUrl = (customPath?: string) => {
  const siteUrl = getSiteUrl();
  const path = customPath || '/auth/callback';
  return `${siteUrl}${path}`;
};

export const isProduction = () => {
  return getEnvironment() === 'production';
};

export const isDevelopment = () => {
  return getEnvironment() === 'development';
};

// Debug function to log all environment info
export const logEnvironmentInfo = () => {
  console.log('🌍 Environment Info:', {
    environment: getEnvironment(),
    siteUrl: getSiteUrl(),
    apiUrl: getApiUrl(),
    callbackUrl: getCallbackUrl(),
    isProduction: isProduction(),
    isDevelopment: isDevelopment(),
    envVariables: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },
    windowLocation: typeof window !== 'undefined' ? {
      origin: window.location.origin,
      hostname: window.location.hostname,
      href: window.location.href,
    } : 'server-side'
  });
}; 