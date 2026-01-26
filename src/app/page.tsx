import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'

export default function HomePage() {
  return (
    <main className="bg-black text-white">
      <Hero />
      <Features />
    </main>
  )
}
