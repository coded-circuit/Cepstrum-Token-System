"use client";
import CryptoJS from 'crypto-js';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

// Replaced chaotic balloons with elegant upward-drifting golden particles
function ElegantParticles() {
  const [particles] = useState(() => {
    return [...Array(25)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 15,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.4 + 0.1,
    }));
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute bg-yellow-500 rounded-full animate-drift"
          style={{
            left: `${particle.left}%`,
            bottom: '-20px',
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes drift {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% { opacity: var(--tw-bg-opacity, 1); }
          90% { opacity: var(--tw-bg-opacity, 1); }
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

export default function GuestPass() {
  const params = useParams();
  const [guest, setGuest] = useState(null);
  const [qrData, setQrData] = useState("");
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Poll for guest status updates every 2 seconds
  const checkGuestStatus = async () => {
    if (!guest || guest.isDined) return;
    
    try {
      const res = await fetch(`/api/guest/${params.id}`);
      const data = await res.json();
      if (data.success && data.guest.isDined) {
        setGuest(data.guest);
      }
    } catch (err) {
      console.error('Status check error:', err);
    }
  };

  useEffect(() => {
    fetch(`/api/guest/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setGuest(data.guest);
        } else {
          setError(data.message || 'Failed to load guest details');
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Network error. Please try again.');
        setLoading(false);
      });
  }, [params.id]);

  useEffect(() => {
    if (!guest || guest.isDined) return;
    
    const interval = setInterval(checkGuestStatus, 2000);
    return () => clearInterval(interval);
  }, [guest]);

  useEffect(() => {
    if (!guest) return;

    const generateCode = () => {
      const timestamp = Date.now();
      const signature = CryptoJS.HmacSHA256(timestamp.toString(), guest.secretKey).toString(CryptoJS.enc.Hex);
      setQrData(JSON.stringify({ id: guest._id, timestamp, signature }));
      setTimer(15);
    };

    generateCode();
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev === 1) { generateCode(); return 60; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [guest]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-yellow-500 border-r-transparent border-b-yellow-500 border-l-transparent mx-auto"></div>
          <p className="text-zinc-500 text-xs mt-6 font-semibold uppercase tracking-widest animate-pulse">Initializing Pass...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
        <div className="bg-[#0a0a0a] border border-red-900/50 rounded-sm p-8 max-w-md text-center">
          <div className="text-4xl mb-4 text-red-500">✗</div>
          <h2 className="text-lg font-semibold text-white tracking-wider uppercase mb-2">Access Error</h2>
          <p className="text-zinc-400 mb-6 text-sm">{error}</p>
          <p className="text-xs text-zinc-600 uppercase tracking-widest">Contact CEPSTRUM Support</p>
        </div>
      </div>
    );
  }

  if (!guest) return null;

  // ---------------------------------------------------------------------------
  // SUCCESS / DINED STATE
  // ---------------------------------------------------------------------------
  if (guest.isDined) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden font-sans">
        <ElegantParticles />
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            
            <div className="bg-[#0a0a0a] border border-yellow-500/20 rounded-sm p-8 md:p-10 shadow-[0_0_30px_rgba(234,179,8,0.03)] relative">
              
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl text-yellow-500">✓</span>
                </div>
                <h1 className="text-2xl font-light tracking-[0.1em] text-white uppercase mb-2">
                  Access Granted
                </h1>
                <p className="text-zinc-500 text-xs uppercase tracking-widest">Have a great time</p>
              </div>
              
              <div className="bg-black border border-zinc-800 rounded-sm p-6 mb-6">
                <div className="text-center border-b border-zinc-800 pb-4 mb-4">
                  <h2 className="text-xl font-medium text-white tracking-wider mb-1">{guest.name}</h2>
                  <p className="text-yellow-500 text-xs uppercase tracking-widest">{guest.branch} • {guest.year}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-xs uppercase tracking-wider">Roll Number</span>
                    <span className="text-white text-sm font-mono">{guest.rollNumber}</span>
                  </div>
                  {guest.foodPreference && (
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 text-xs uppercase tracking-wider">Preference</span>
                      <span className={`text-xs font-semibold uppercase tracking-widest px-2 py-1 rounded-sm ${
                        guest.foodPreference === 'veg' 
                          ? 'bg-emerald-950/50 text-emerald-500 border border-emerald-900/50' 
                          : 'bg-red-950/50 text-red-500 border border-red-900/50'
                      }`}>
                        {guest.foodPreference === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-yellow-500/80 text-xs uppercase tracking-widest">
                  Enjoy your farewell party
                </p>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // ACTIVE QR CODE STATE
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-black relative overflow-hidden font-sans">
      <ElegantParticles />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-light tracking-[0.2em] text-white mb-2">
              CEPSTRUM
            </h1>
            <h2 className="text-sm md:text-base font-semibold tracking-widest text-yellow-500 uppercase mb-6">
              Farewell 2026
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px flex-1 bg-yellow-500/20"></div>
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Digital Dining Pass</p>
              <div className="h-px flex-1 bg-yellow-500/20"></div>
            </div>
          </div>

          {/* Main Pass Card */}
          <div className="bg-[#0a0a0a] border border-yellow-500/30 rounded-sm p-8 text-center relative shadow-[0_0_40px_rgba(234,179,8,0.05)]">
            
            <p className="text-[10px] text-zinc-500 mb-6 uppercase tracking-[0.3em]">Present this code</p>
            
            {/* QR Code Container */}
            <div className="inline-block bg-white p-4 rounded-sm mb-6 border-4 border-[#1a1a1a]">
              <QRCodeSVG value={qrData} size={220} level="H" />
            </div>
            
            {/* Minimalist Timer */}
            <div className="mb-8 flex items-center justify-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${timer > 10 ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}></div>
              <p className="text-xs text-zinc-400 uppercase tracking-widest font-mono">
                Refresh in: {timer.toString().padStart(2, '0')}s
              </p>
            </div>

            {/* Guest Details */}
            <div className="border-t border-zinc-800 pt-6">
              <h2 className="text-xl font-medium text-white uppercase tracking-widest mb-1">{guest.name}</h2>
              <p className="text-sm text-yellow-500 font-mono mb-2">{guest.rollNumber}</p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">{guest.branch} • {guest.year}</p>
            </div>
          </div>

          {/* Footer Instructions */}
          <div className="mt-8 text-center">
            <p className="text-[10px] text-zinc-600 uppercase tracking-[0.2em]">
              Screen brightness up • Do not close window
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}