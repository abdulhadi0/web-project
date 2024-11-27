"use client"

import { getServerSession } from 'next-auth/next';
import { signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { authConfig } from '../../lib/auth-config';

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);
  
  if (!session) {
    redirect('/auth/signin');
  }

  const handleSignOut = async () => {
    await signOut({ 
      redirect: true, 
      callbackUrl: '/auth/signin' 
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Welcome, {session.user.username}!</h1>
      <p>Role: {session.user.role}</p>
     
      <button 
        onClick={handleSignOut} 
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}