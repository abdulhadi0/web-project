'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignUpPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Basic client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setError(null);
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Sign up failed');
        return;
      }

      // Redirect to sign-in page
      router.push('/auth/signin');
    } catch (err) {
      setError('An unexpected error occurred');
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up for RateMyInstructor</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block mb-2">Username</label>
              <Input 
                id="username"
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username" 
                required 
                minLength={3}
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-2">Email</label>
              <Input 
                id="email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
                required 
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-2">Password</label>
              <Input 
                id="password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password" 
                required 
                minLength={8}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block mb-2">Confirm Password</label>
              <Input 
                id="confirm-password"
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password" 
                required 
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full">Sign Up</Button>
          </form>
          <div className="mt-4 text-center">
            <p>
              Already have an account? {' '}
              <a href="/auth/signin" className="text-blue-600 hover:underline">
                Sign In
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}