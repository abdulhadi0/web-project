'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-gray-600">&copy; {new Date().getFullYear()} RateMyProfessor. All rights reserved.</p>
          {/* Add links here if needed */}
          <div className="mt-4">
            <Link href="/privacy-policy" className="text-gray-600 hover:text-gray-800">Privacy Policy</Link>
            <span className="mx-2">|</span>
            <Link href="/terms" className="text-gray-600 hover:text-gray-800">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
