'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setError(null);
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      });

      console.log(result)

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In to RateMyInstructor</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Enter your password" 
                required 
              />
            </div>
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
          <div className="mt-4 text-center">
            <p>
              Don't have an account? {' '}
              <a href="/auth/signup" className="text-blue-600 hover:underline">
                Sign Up
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}