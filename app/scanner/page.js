"use client";
// Added Html5QrcodeScanType to the import
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function Scanner() {
  const router = useRouter();
  const [scanState, setScanState] = useState('idle'); // 'idle' | 'success' | 'already-dined' | 'unauthorized'
  const [guestData, setGuestData] = useState(null);
  const [showFoodSelector, setShowFoodSelector] = useState(false);
  const [countdown, setCountdown] = useState(20);
  
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);
  const countdownRef = useRef(null);

  const resetScanner = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setScanState('idle');
    setGuestData(null);
    setShowFoodSelector(false);
    setCountdown(20);
    isProcessingRef.current = false;
    
    if (scannerRef.current) {
      try {
        scannerRef.current.resume();
      } catch (e) {
        console.error("Failed to resume scanner", e);
      }
    }
  };

  useEffect(() => {
    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        // THIS LINE DISABLES FILE UPLOADS:
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] 
      },
      false
    );
    
    scannerRef.current = scanner;
    
    scanner.render(async (text) => {
      if (isProcessingRef.current) return;
      
      isProcessingRef.current = true;
      scanner.pause(true); 
      
      try {
        const payload = JSON.parse(text);
        
        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if (data.success && data.requiresFoodSelection) {
          setScanState('success');
          setGuestData(data.guest);
          setShowFoodSelector(true);
        } else if (data.success) {
          setScanState('success');
          setGuestData(data.guest);
          setShowFoodSelector(false);
          setCountdown(20);
          
          // Start countdown
          countdownRef.current = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                resetScanner();
                return 20;
              }
              return prev - 1;
            });
          }, 1000);
        } else if (data.alreadyDined) {
          setScanState('already-dined');
          setGuestData(data.guest);
          setTimeout(resetScanner, 3000);
        } else {
          setScanState('unauthorized');
          setGuestData(null);
          setTimeout(resetScanner, 2000);
        }
      } catch (e) {
        setScanState('unauthorized');
        setGuestData(null);
        setTimeout(resetScanner, 2000);
      }
    }, (err) => { /* ignore empty scans */ });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, []); 

  const handleFoodSelection = async (preference) => {
    try {
      const res = await fetch('/api/guest/update-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: guestData._id,
          foodPreference: preference
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowFoodSelector(false);
        setGuestData({ ...guestData, foodPreference: preference });
        setCountdown(20);
        
        // Start 20-second countdown after food selection
        if (countdownRef.current) clearInterval(countdownRef.current);
        countdownRef.current = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              resetScanner();
              return 20;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        alert('SYSTEM ERROR: Failed to save preference.');
      }
    } catch (error) {
      alert('NETWORK ERROR: Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black font-sans text-zinc-300 selection:bg-yellow-500/30 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        
        {/* Terminal Header */}
        <div className="text-center mb-8 border-b border-zinc-800 pb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              scanState === 'idle' ? 'bg-yellow-500' : 
              scanState === 'success' ? 'bg-emerald-500' : 
              scanState === 'already-dined' ? 'bg-orange-500' : 'bg-red-500'
            }`}></div>
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-500">
              Entry Control Terminal
            </span>
          </div>
          <h1 className="text-2xl font-light tracking-[0.1em] text-white uppercase">
            {scanState === 'idle' && 'Awaiting Scan'}
            {scanState === 'success' && 'Access Granted'}
            {scanState === 'already-dined' && 'Duplicate Scan'}
            {scanState === 'unauthorized' && 'Access Denied'}
          </h1>
        </div>

        {/* Scanner Container */}
        <div className={`transition-all duration-300 ${scanState !== 'idle' ? 'hidden' : 'block'}`}>
          <div className="bg-[#0a0a0a] border-2 border-zinc-800 rounded-sm p-2 shadow-[0_0_30px_rgba(234,179,8,0.03)] relative">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-500 -translate-x-[2px] -translate-y-[2px]"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-yellow-500 translate-x-[2px] -translate-y-[2px]"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-yellow-500 -translate-x-[2px] translate-y-[2px]"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-yellow-500 translate-x-[2px] translate-y-[2px]"></div>
            
            {/* The actual video feed container */}
            <div id="reader" className="w-full bg-black rounded-sm overflow-hidden"></div>
          </div>
        </div>

        {/* Success State */}
        {scanState === 'success' && guestData && !showFoodSelector && (
          <div className="bg-[#0a0a0a] border border-emerald-900/50 rounded-sm p-8 text-center shadow-[0_0_40px_rgba(16,185,129,0.05)] relative">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500 -translate-x-[2px] -translate-y-[2px]"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500 translate-x-[2px] -translate-y-[2px]"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500 -translate-x-[2px] translate-y-[2px]"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500 translate-x-[2px] translate-y-[2px]"></div>
            
            <div className="text-4xl text-emerald-500 mb-4">✓</div>
            <h2 className="text-xl font-medium text-white tracking-widest uppercase mb-1">{guestData.name}</h2>
            <p className="text-emerald-500 font-mono text-sm mb-6">{guestData.rollNumber}</p>
            
            <div className="space-y-3 text-left bg-black border border-zinc-800 p-4 rounded-sm">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Branch</span>
                <span className="text-xs font-mono text-white">{guestData.branch} // YR {guestData.year.charAt(0)}</span>
              </div>
              {guestData.foodPreference && (
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Meal</span>
                  <span className={`text-[10px] px-2 py-1 uppercase tracking-widest font-mono border ${
                    guestData.foodPreference === 'veg' 
                      ? 'text-emerald-500 border-emerald-900/50 bg-emerald-950/20' 
                      : 'text-red-500 border-red-900/50 bg-red-950/20'
                  }`}>
                    {guestData.foodPreference}
                  </span>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-transparent border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white text-xs font-mono uppercase tracking-widest py-3 rounded-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </button>
              <button
                onClick={resetScanner}
                className="flex-1 bg-transparent border border-emerald-900/50 hover:border-emerald-500 text-emerald-500 hover:bg-emerald-950/20 text-xs font-mono uppercase tracking-widest py-3 rounded-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Scan Again
              </button>
            </div>
            
            <div className="mt-4">
               <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">Auto-resetting in {countdown}s...</span>
            </div>
          </div>
        )}

        {/* Food Selector Modal */}
        {showFoodSelector && guestData && (
          <div className="bg-[#0a0a0a] border border-yellow-500/30 rounded-sm p-8 text-center relative shadow-[0_0_40px_rgba(234,179,8,0.05)]">
            <div className="text-2xl text-yellow-500 mb-2 font-light tracking-widest uppercase">Select Ration</div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-8">
              Required for {guestData.rollNumber}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleFoodSelection('veg')}
                className="bg-black border border-emerald-900/50 hover:border-emerald-500 text-emerald-500 py-6 px-4 rounded-sm transition-all flex flex-col items-center gap-2 group"
              >
                <div className="w-8 h-8 rounded-full border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-950/30 transition-colors">
                   <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                </div>
                <span className="text-[10px] font-mono tracking-widest uppercase">Vegetarian</span>
              </button>
              
              <button
                onClick={() => handleFoodSelection('non-veg')}
                className="bg-black border border-red-900/50 hover:border-red-500 text-red-500 py-6 px-4 rounded-sm transition-all flex flex-col items-center gap-2 group"
              >
                 <div className="w-8 h-8 rounded-full border border-red-500/30 flex items-center justify-center group-hover:bg-red-950/30 transition-colors">
                   <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                </div>
                <span className="text-[10px] font-mono tracking-widest uppercase">Non-Veg</span>
              </button>
            </div>
            
            <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest mt-6">
              Selection is permanent. Input carefully.
            </p>
          </div>
        )}

        {/* Already Dined State */}
        {scanState === 'already-dined' && guestData && (
          <div className="bg-[#0a0a0a] border border-orange-900/50 rounded-sm p-8 text-center shadow-[0_0_40px_rgba(249,115,22,0.05)] relative">
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-orange-500 -translate-x-[2px] -translate-y-[2px]"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-orange-500 translate-x-[2px] -translate-y-[2px]"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-orange-500 -translate-x-[2px] translate-y-[2px]"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-orange-500 translate-x-[2px] translate-y-[2px]"></div>
            
            <div className="text-4xl text-orange-500 mb-4">⚠</div>
            <h2 className="text-xl font-medium text-white tracking-widest uppercase mb-1">{guestData.name}</h2>
            <p className="text-orange-500 font-mono text-sm mb-6">{guestData.rollNumber}</p>
            
            <div className="bg-orange-950/20 border border-orange-900/30 p-4 rounded-sm mb-6">
               <p className="text-xs text-orange-400 uppercase tracking-widest mb-1">Status: Already Checked In</p>
               {guestData.scannedAt && (
                  <p className="text-[10px] text-zinc-500 font-mono">First scan: {new Date(guestData.scannedAt).toLocaleTimeString()}</p>
               )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-transparent border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white text-xs font-mono uppercase tracking-widest py-3 rounded-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </button>
              <button
                onClick={resetScanner}
                className="flex-1 bg-transparent border border-orange-900/50 hover:border-orange-500 text-orange-500 hover:bg-orange-950/20 text-xs font-mono uppercase tracking-widest py-3 rounded-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Scan Again
              </button>
            </div>
          </div>
        )}

        {/* Unauthorized State */}
        {scanState === 'unauthorized' && (
          <div className="bg-[#0a0a0a] border border-red-900/50 rounded-sm p-8 text-center shadow-[0_0_40px_rgba(239,68,68,0.05)]">
            <div className="text-4xl text-red-500 mb-4">✗</div>
            <h2 className="text-xl font-medium text-red-500 tracking-widest uppercase mb-2">Invalid Token</h2>
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-6">QR code not found in registry</p>
            <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">Auto-resetting in 2s...</span>
          </div>
        )}
      </div>

      <style jsx global>{`
        #reader {
          border: none !important;
        }
        #reader img {
          display: none !important; 
        }
        #reader__dashboard_section_csr span {
          color: #a1a1aa !important; 
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
          font-size: 10px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
        }
        #reader button {
          background-color: #000 !important;
          border: 1px solid #3f3f46 !important; 
          color: #eab308 !important; 
          padding: 8px 16px !important;
          border-radius: 2px !important;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
          font-size: 10px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          cursor: pointer !important;
          margin-top: 10px !important;
          transition: all 0.2s !important;
        }
        #reader button:hover {
          background-color: rgba(234, 179, 8, 0.1) !important;
          border-color: #eab308 !important;
        }
        #reader select {
          background-color: #000 !important;
          border: 1px solid #3f3f46 !important;
          color: #eab308 !important;
          padding: 8px !important;
          border-radius: 2px !important;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
          font-size: 10px !important;
          margin-bottom: 10px !important;
          width: 100% !important;
        }
      `}</style>
    </div>
  );
}