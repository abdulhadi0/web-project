'use client'

import { useSession, signOut } from "next-auth/react"
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      redirect: true,
      callbackUrl: '/auth/signin',
    });
  };

  if (status === "authenticated") {
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
  } else {
    return <a href="/auth/signin">Sign in</a>;
  }
}
