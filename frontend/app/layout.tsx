import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Unreal House',
  description: 'A multi-room AI conversation experience - each room tells its own story',
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