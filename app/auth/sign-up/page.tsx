"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Correct import for useRouter in App Router
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/lib/auth'; // Import useAuth hook

// Define your backend API URL
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

export default function SignUpPage() {
  const [contact, setContact] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<'VOLUNTEER' | 'ADMIN'>('VOLUNTEER');
  const [consentFaceQr, setConsentFaceQr] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { login } = useAuth(); // Get login function from auth context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // FastAPI expects JSON for register endpoint
        },
        body: JSON.stringify({
          contact,
          password,
          role,
          consent_face_qr: consentFaceQr,
        }),
      });

      if (response.ok) {
        // Automatically log in the user after successful registration
        const loginResponse = await fetch(`${BACKEND_API_URL}/auth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `username=${encodeURIComponent(contact)}&password=${encodeURIComponent(password)}`,
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          await login(loginData.access_token, loginData.refresh_token); // Update client-side AuthContext
          router.push('/volunteer'); // Redirect to dashboard
        } else {
          // If auto-login fails, redirect to sign-in with a message
          const loginErrorData = await loginResponse.json();
          setError(loginErrorData.detail || 'Registration successful, but failed to log in automatically.');
          router.push('/auth/sign-in?message=Registration successful. Please sign in manually.');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to sign up. Please try again.');
      }
    } catch (err) {
      console.error('Sign-up error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign Up</h1>
          <p className="text-muted-foreground">
            Create your account to start using the Lost & Found System.
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label>Role</Label>
            <RadioGroup value={role} onValueChange={(value: 'VOLUNTEER' | 'ADMIN') => setRole(value)} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="VOLUNTEER" id="role-volunteer" disabled={loading} />
                <Label htmlFor="role-volunteer">Volunteer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ADMIN" id="role-admin" disabled={loading} />
                <Label htmlFor="role-admin">Admin</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="consent"
              checked={consentFaceQr}
              onCheckedChange={(checked) => setConsentFaceQr(checked as boolean)}
              disabled={loading}
            />
            <Label htmlFor="consent" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              I consent to facial recognition and QR tagging for lost/found matching.
            </Label>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </form>
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/sign-in" className="underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
