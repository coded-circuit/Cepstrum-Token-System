import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 font-sans relative">
      
      {/* Background ambient light effect (subtle) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="z-10 text-center w-full max-w-4xl">
        <h2 className="text-white text-3xl md:text-5xl font-bold mb-2">
          Welcome to the
        </h2>
        <h1 className="text-yellow-400 text-5xl md:text-7xl font-extrabold mb-12 drop-shadow-md">
          CEPSTRUM FAREWELL <span className="text-white text-4xl md:text-6xl">2026</span>
        </h1>

        <div className="flex flex-col md:flex-row gap-6 justify-center mt-12">
          {/* Guest Portal */}
          <Link href="/pass" className="group px-8 py-4 bg-transparent border-2 border-slate-600 hover:border-white text-white font-bold rounded transition-all hover:bg-white/5">
            <span className="block text-xs text-slate-400 mb-1 group-hover:text-slate-300">ATTENDEES</span>
            GUEST PORTAL
          </Link>

          {/* Scanner */}
          <Link href="/scanner" className="group px-8 py-4 bg-yellow-500 border-2 border-yellow-500 hover:bg-yellow-400 hover:border-yellow-400 text-black font-extrabold rounded transition-all shadow-[0_0_15px_rgba(234,179,8,0.3)]">
            <span className="block text-xs text-yellow-900 mb-1">ORGANIZERS</span>
            LAUNCH SCANNER
          </Link>

          {/* Admin Command - Now routes directly to login */}
          <Link href="/admin/login" className="group px-8 py-4 bg-transparent border-2 border-red-900/50 hover:border-red-500 text-slate-300 hover:text-white font-bold rounded transition-all hover:bg-red-950/30">
             <span className="block text-xs text-red-500 mb-1">CORE TEAM</span>
            ADMIN ACCESS
          </Link>
        </div>
      </div>
    </div>
  );
}