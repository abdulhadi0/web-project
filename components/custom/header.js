'use client'

import Link from 'next/link'
import Image from 'next/image'
import UserMenu from './UserMenu'

export default function Header() {

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.svg" alt="RateMyProfessor Logo" width={40} height={40} />
          <span className="text-xl font-bold text-gray-800">RateMyProfessor</span>
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li><Link href="/Rate" className="text-gray-600 hover:text-gray-800">Your Ratings</Link></li>
            <li><Link href="/Instructors" className="text-gray-600 hover:text-gray-800">Instructors</Link></li>
          </ul>
        </nav>
        <UserMenu />
      </div>
    </header>
  )
}

