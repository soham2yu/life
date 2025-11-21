import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LifeScore - The Global Proof of Real Ability',
  description: 'Replace static resumes with a dynamic, verified profile of your real skills. Measure creativity, adaptability, and problem-solving with AI-powered assessments.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-black text-white`}>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  )
}
