'use client'

import { useState } from 'react'
import { useSession, signOut } from "next-auth/react"
import Link from 'next/link'
import { User, ChevronDown, LogOut, Settings } from 'lucide-react'

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session, status } = useSession();
  const handleSignOut = async () => {
    await signOut({
      redirect: true,
      callbackUrl: '/auth/signin',
    });
  };

  return ( status === "authenticated" ?
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
      >
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <User size={20} />
        </div>
        <ChevronDown size={16} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut size={16} className="inline mr-2" />
            Log out
          </button>
        </div>
      )}
    </div> : <div className="relative w-32"></div>
  )
}
