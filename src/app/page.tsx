import { Hero } from '@/components/landing/hero'
import { Features } from '@/components/landing/features'
import { Navbar } from '@/components/landing/navbar'

export default function HomePage() {
  return (
    <main className="bg-black text-white">
      <Navbar />
      <Hero />
      <Features />
    </main>
  )
}
