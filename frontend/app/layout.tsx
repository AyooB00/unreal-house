import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dio Radio Mini',
  description: '24/7 AI-Powered Cyberpunk Conversations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white font-mono antialiased">{children}</body>
    </html>
  )
}