'use client';

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Loader2 } from "lucide-react"

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const [loginError, setLoginError] = useState<string>('');

  const handleGithubLogin = async () => {
    try {
      setLoginError('');
      await login();
    } catch (error: any) {
      console.error('GitHub login failed:', error);
      setLoginError(error.message || 'Failed to initiate GitHub login');
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Sign in to your account using GitHub
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loginError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{loginError}</p>
          </div>
        )}

        <Button 
          onClick={handleGithubLogin}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Github className="mr-2 h-4 w-4" />
              Continue with GitHub
            </>
          )}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
          
          <div className="pt-2">
            <p className="text-xs text-gray-400">
              Secure authentication powered by GitHub OAuth
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
