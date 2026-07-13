import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import './globals.css'
import NavBar from "@/app/components/NavBar"
import UserProvider from "@/app/components/UserContext"

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'NG+ | Your Gaming Identity',
  description: 'Track, rate, and share the games that define you.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>
        <UserProvider>
          <header className="w-full">
            <NavBar />
          </header>
          <div className="min-h-screen bg-[#0e0e10] text-[#f0f0f0]">
            {children}
          </div>
        </UserProvider>
      </body>
    </html>
  )
}