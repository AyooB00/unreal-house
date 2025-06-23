'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface Room {
  path: string
  name: string
  description: string
  color: string
  icon: string
}

const rooms: Room[] = [
  {
    path: '/',
    name: 'HOME',
    description: 'Main Landing Page',
    color: 'text-gray-400',
    icon: '🏠'
  },
  {
    path: '/classic',
    name: 'CLASSIC',
    description: 'Original Cyberpunk Philosophy',
    color: 'text-purple-400',
    icon: '🌆'
  },
  {
    path: '/philosophy',
    name: 'PHILOSOPHY',
    description: 'Deep Thoughts & Tech',
    color: 'text-cyan-400',
    icon: '🧠'
  },
  {
    path: '/cryptoana',
    name: 'CRYPTOANA',
    description: '24/7 Crypto Market Analysis',
    color: 'text-green-400',
    icon: '📈'
  }
]

export function RoomSelector() {
  const pathname = usePathname()
  
  return (
    <div className="flex items-center gap-1 bg-black/50 rounded-lg px-2 py-1 backdrop-blur-sm border border-white/10">
      {rooms.map((room, index) => {
        const isActive = pathname === room.path
        
        return (
          <div key={room.path} className="flex items-center">
            <Link
              href={room.path}
              className={`
                px-3 py-1 rounded transition-all duration-300 text-xs uppercase tracking-wider font-medium
                ${isActive 
                  ? `${room.color} bg-current bg-opacity-10` 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }
              `}
              title={room.description}
            >
              <span className="mr-1">{room.icon}</span>
              <span>{room.name}</span>
            </Link>
            {index < rooms.length - 1 && (
              <span className="mx-1 text-gray-700">|</span>
            )}
          </div>
        )
      })}
    </div>
  )
}