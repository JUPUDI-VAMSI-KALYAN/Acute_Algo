'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi, AuthUser } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string>('');
  const [userDetails, setUserDetails] = useState<AuthUser | null>(null);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    // Prevent multiple processing attempts
    if (hasProcessed) {
      return;
    }

    const handleCallback = async () => {
      setHasProcessed(true);
      console.log('🔄 Starting GitHub OAuth callback processing...');
      
      try {
        // Get the authorization code from URL parameters
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        
        console.log('📋 OAuth parameters:', { code: code ? 'present' : 'missing', error });

        if (error) {
          throw new Error(`GitHub OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received from GitHub');
        }

        console.log('Processing GitHub OAuth callback with code:', code);

        // Exchange code for user session
        const response = await authApi.handleGithubCallback(code);

        if (response.success && response.user) {
          setUserDetails(response.user);
          setStatus('success');
          
          // Log user details to console as requested
          console.log('=== FRONTEND: USER LOGIN SUCCESSFUL ===');
          console.log('User ID:', response.user.id);
          console.log('Email:', response.user.email);
          console.log('Name:', response.user.name || 'N/A');
          console.log('GitHub Username:', response.user.githubUsername || 'N/A');
          console.log('Avatar URL:', response.user.avatarUrl || 'N/A');
          console.log('Created At:', response.user.createdAt);
          console.log('=========================================');
          console.log('✅ Authentication completed successfully - redirecting to dashboard');

          // Clear the URL parameters to prevent reuse
          window.history.replaceState({}, document.title, window.location.pathname);

          // Update the AuthContext with the user data we already have
          // This avoids making an extra API call but keeps the user authenticated
          await refreshUser();

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          throw new Error('Authentication failed: No user data received');
        }
      } catch (err: unknown) {
        console.error('Authentication callback failed:', err);
        
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        
        // Handle specific case where auth code has already been used
        if (errorMessage.includes('auth code')) {
          setError('This authentication link has already been used. Please try logging in again.');
        } else {
          setError(errorMessage);
        }
        setStatus('error');
      }
    };

    handleCallback();
  }, [hasProcessed, searchParams, refreshUser, router]); // Add proper dependencies

  const handleRetry = () => {
    router.push('/login');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            GitHub Authentication
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Processing your authentication...
          </p>
        </div>

        <Card className="mt-8">
          <CardHeader className="text-center">
            {status === 'processing' && (
              <>
                <div className="flex justify-center mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
                <CardTitle>Authenticating...</CardTitle>
                <CardDescription>
                  Please wait while we process your GitHub authentication
                </CardDescription>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-green-600">Authentication Successful!</CardTitle>
                <CardDescription>
                  Welcome back! You will be redirected to the dashboard shortly.
                </CardDescription>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="flex justify-center mb-4">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-red-600">Authentication Failed</CardTitle>
                <CardDescription>
                  There was an error during authentication
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent>
            {status === 'success' && userDetails && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">User Details:</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Email:</strong> {userDetails.email}</p>
                    {userDetails.name && <p><strong>Name:</strong> {userDetails.name}</p>}
                    {userDetails.githubUsername && (
                      <p><strong>GitHub:</strong> {userDetails.githubUsername}</p>
                    )}
                  </div>
                </div>
                
                <Button 
                  onClick={handleGoToDashboard}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
                
                <Button 
                  onClick={handleRetry}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            )}

            {status === 'processing' && (
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  This should only take a few seconds...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
} 