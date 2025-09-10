"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Correct import for useRouter in App Router
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth'; // Import useAuth hook

// Define your backend API URL
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

export default function SignInPage() {
  const [contact, setContact] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { login } = useAuth(); // Get login function from auth context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_API_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // FastAPI expects form-urlencoded for OAuth2PasswordRequestForm
        },
        body: `username=${encodeURIComponent(contact)}&password=${encodeURIComponent(password)}`,
      });

      if (response.ok) {
        const data = await response.json();
        // Update client-side AuthContext with the access token
        await login(data.access_token, data.refresh_token); 
        router.push('/volunteer'); // Redirect to dashboard or appropriate page
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to sign in. Please check your credentials.');
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-muted-foreground">
            Enter your contact (email/phone) and password to access your account.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="contact">Contact (Email or Phone)</Label>
            <Input
              id="contact"
              type="text"
              placeholder="you@example.com or +1234567890"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline">
                Forgot your password? {/* Placeholder for future implementation */}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/auth/sign-up" className="underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
