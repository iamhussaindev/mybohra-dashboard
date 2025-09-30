import Cursor from '@components/ui/atoms/Cursor'
import ToastContainer from '@components/ui/molecules/ToastContainer'
import { ReactLenis } from 'lenis/react'
import { Metadata } from 'next'
import localFont from 'next/font/local'
import { Suspense } from 'react'
import './globals.css'

const satoshi = localFont({
  src: '../assets/fonts/Satoshi-Variable.woff2',
  variable: '--font-satoshi',
})

const clashDisplay = localFont({
  src: '../assets/fonts/ClashDisplay-Variable.woff2',
  variable: '--font-clash-display',
})

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'MyBohra Dashboard',
    description: 'Modern dashboard application with Supabase authentication and Google OAuth integration',
    url: 'https://iamhussain.dev',
    siteName: 'MyBohra Dashboard',
    images: ['https://iamhussain.dev/banner.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyBohra Dashboard',
    description: 'Modern dashboard application with Supabase authentication and Google OAuth integration',
    images: ['https://iamhussain.dev/banner.png'],
  },
  alternates: {
    canonical: 'https://iamhussain.dev',
  },
  metadataBase: new URL('https://iamhussain.dev'),
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
  keywords: ['Dashboard', 'Supabase', 'Authentication', 'Google OAuth', 'Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
  authors: [{ name: 'Hussain Dehgamwala', url: 'https://iamhussain.dev' }],
  title: 'MyBohra Dashboard',
  description: 'Modern dashboard application with Supabase authentication and Google OAuth integration',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body suppressHydrationWarning className={`${satoshi.variable} ${clashDisplay.variable} relative`}>
        <ReactLenis root>
          <Cursor />
          <Suspense fallback={<div>Loading...</div>}>
            <ToastContainer />
            {children}
          </Suspense>
        </ReactLenis>
      </body>
    </html>
  )
}
