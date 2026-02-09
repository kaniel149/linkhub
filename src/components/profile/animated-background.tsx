'use client'

interface AnimatedBackgroundProps {
  primaryColor: string
  backgroundColor: string
}

export function AnimatedBackground({ primaryColor, backgroundColor }: AnimatedBackgroundProps) {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{ backgroundColor }}
    >
      {/* Gradient blob 1 — top left, slow drift */}
      <div
        className="absolute -top-[20%] -left-[15%] w-[600px] h-[600px] rounded-full animate-[drift1_18s_ease-in-out_infinite]"
        style={{
          background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
          opacity: 0.12,
          filter: 'blur(80px)',
        }}
      />

      {/* Gradient blob 2 — bottom right */}
      <div
        className="absolute -bottom-[20%] -right-[15%] w-[500px] h-[500px] rounded-full animate-[drift2_20s_ease-in-out_infinite]"
        style={{
          background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
          opacity: 0.1,
          filter: 'blur(80px)',
        }}
      />

      {/* Gradient blob 3 — center, subtle */}
      <div
        className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] rounded-full animate-[drift3_15s_ease-in-out_infinite]"
        style={{
          background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
          opacity: 0.08,
          filter: 'blur(100px)',
        }}
      />

      {/* Gradient blob 4 — top right accent */}
      <div
        className="absolute top-[10%] right-[20%] w-[300px] h-[300px] rounded-full animate-[drift4_17s_ease-in-out_infinite]"
        style={{
          background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
          opacity: 0.06,
          filter: 'blur(60px)',
        }}
      />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px',
      }} />

      <style jsx>{`
        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(60px, 40px) scale(1.1); }
          66% { transform: translate(-30px, 20px) scale(0.95); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0) scale(1.05); }
          50% { transform: translate(-50px, -30px) scale(1); }
        }
        @keyframes drift3 {
          0%, 100% { transform: translate(-50%, 0) scale(0.9); }
          50% { transform: translate(-50%, -20px) scale(1.15); }
        }
        @keyframes drift4 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-40px, 30px); }
        }
        @media (prefers-reduced-motion: reduce) {
          div[class*="animate-"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
