import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VedaAI - AI Teacher\'s Toolkit',
  description: 'Create AI-powered question papers and assignments for your students',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}
