import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'james@flyingrobots:~$ whoami',
  description: 'James Ross - Staff Software Engineer | Game Infrastructure & Engine Architecture',
  keywords: ['software engineer', 'game development', 'infrastructure', 'portfolio'],
  authors: [{ name: 'James Ross' }],
  openGraph: {
    type: 'website',
    title: 'James Ross - Staff Software Engineer',
    description: '18 years building game infrastructure that scales',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}