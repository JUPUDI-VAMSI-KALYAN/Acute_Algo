// Debug utility for authentication troubleshooting
export const authDebug = {
  // Check current token status
  checkTokenStatus: () => {
    if (typeof window === 'undefined') {
      console.log('🔍 Auth Debug: Running on server side');
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    console.log('🔍 Auth Debug Status:');
    console.log('- Access Token:', accessToken ? 'Present' : 'Missing');
    console.log('- Refresh Token:', refreshToken ? 'Present' : 'Missing');
    console.log('- Current URL:', window.location.href);
    
    if (accessToken) {
      try {
        // Basic JWT decode to check expiration (without verification)
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp && payload.exp < now;
        
        console.log('- Token Expires:', payload.exp ? new Date(payload.exp * 1000).toISOString() : 'Unknown');
        console.log('- Token Expired:', isExpired);
      } catch {
        console.log('- Token Format: Not a valid JWT');
      }
    }
  },
  
  // Clear all auth data
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      console.log('🧹 Auth Debug: Cleared all authentication data');
    }
  },
  
  // Test API connectivity
  testAPI: async () => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    try {
      console.log('🔗 Testing API connectivity to:', API_BASE_URL);
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      console.log('✅ API Response:', data);
    } catch (error) {
      console.error('❌ API Test Failed:', error);
    }
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).authDebug = authDebug;
} 