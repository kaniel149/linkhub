export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#000000] overflow-hidden">
      {/* Animated gradient mesh background — slow-moving dark blues/purples */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(0,113,227,0.15) 0%, transparent 70%)',
            animation: 'auth-mesh-1 25s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(88,28,135,0.15) 0%, transparent 70%)',
            animation: 'auth-mesh-2 30s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-[40%] right-[20%] w-[40%] h-[40%] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(0,163,255,0.1) 0%, transparent 70%)',
            animation: 'auth-mesh-3 20s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes auth-mesh-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(5%, 10%) scale(1.1); }
          66% { transform: translate(-5%, -5%) scale(0.95); }
        }
        @keyframes auth-mesh-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-8%, -6%) scale(1.05); }
          66% { transform: translate(4%, 8%) scale(1.1); }
        }
        @keyframes auth-mesh-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-10%, 5%) scale(1.15); }
        }
      `}</style>

      {children}
    </div>
  )
}
