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
      <div className="min-h-screen bg-gray-100 flex flex-col">
        

        <main className="container mx-auto p-6 flex-grow">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Welcome, {session.user.username}!</h2>
            <p className="text-gray-700 mb-4">Role: {session.user.role}</p>

            <button
              onClick={handleSignOut}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </main>

        <footer className="bg-gray-800 text-white text-center p-4">
          <p>&copy; {new Date().getFullYear()} Rate My Instructor. All rights reserved.</p>
        </footer>
      </div>
    );
  } else {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <a href="/auth/signin" className="text-blue-600 text-lg font-semibold">Sign in</a>
      </div>
    );
  }
}