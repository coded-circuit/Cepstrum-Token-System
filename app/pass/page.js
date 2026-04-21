"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Swapped balloons for elegant, soothing golden particles
function generateParticles() {
  return [...Array(25)].map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 15 + Math.random() * 15,
    size: Math.random() * 4 + 2,
    opacity: Math.random() * 0.4 + 0.1,
  }));
}

export default function GuestVerification() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    rollNumber: '',
    email: '',
    dateOfBirth: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [particles] = useState(generateParticles);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/guest/verify-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/pass/${data.guestId}`);
      } else {
        setError(data.message || 'Verification failed. Please check your details.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden font-sans">
      {/* Soothing Golden Particle Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute bg-yellow-500 rounded-full animate-drift"
            style={{
              left: `${particle.left}%`,
              bottom: '-10px',
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          
          {/* Main Card */}
          <div className="bg-[#0a0a0a] border border-yellow-500/20 rounded-sm p-8 md:p-10 shadow-[0_0_30px_rgba(234,179,8,0.03)] relative">
            
            {/* Elegant Header */}
            <div className="text-center mb-10">
              <h1 className="text-2xl md:text-3xl font-light tracking-[0.2em] text-white mb-2">
                CEPSTRUM
              </h1>
              <h2 className="text-sm md:text-base font-semibold tracking-widest text-yellow-500 uppercase">
                Farewell 2026
              </h2>
              
              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="h-px flex-1 bg-yellow-500/20"></div>
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">
                  Guest Pass Verification
                </p>
                <div className="h-px flex-1 bg-yellow-500/20"></div>
              </div>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Roll Number */}
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Roll Number
                </label>
                <input
                  type="text"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  placeholder="Enter your roll number"
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-yellow-500 transition-colors placeholder-zinc-700 text-sm"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  IITG Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="yourname@iitg.ac.in"
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-yellow-500 transition-colors placeholder-zinc-700 text-sm"
                  required
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-yellow-500 transition-colors text-sm [color-scheme:dark]"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-950/30 border border-red-500/30 text-red-400 px-4 py-3 rounded-sm text-xs text-center">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 uppercase tracking-widest text-xs"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying Identity...
                  </span>
                ) : (
                  'Generate Digital Pass'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                Need assistance? Contact CEPSTRUM team
              </p>
            </div>
            
          </div>
        </div>
      </div>

      {/* CSS for gentle particle drift */}
      <style jsx>{`
        @keyframes drift {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: var(--tw-bg-opacity, 1);
          }
          90% {
            opacity: var(--tw-bg-opacity, 1);
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }
        .animate-drift {
          animation: drift linear infinite;
        }
      `}</style>
    </div>
  );
}