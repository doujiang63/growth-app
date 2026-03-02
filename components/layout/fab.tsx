'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

export function Fab() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/diary/new')}
      className="md:hidden fixed bottom-20 right-5 w-[52px] h-[52px] rounded-full bg-ink text-cream text-xl flex items-center justify-center shadow-fab hover:scale-105 transition-transform z-[99]"
    >
      <Plus size={24} />
    </button>
  )
}
