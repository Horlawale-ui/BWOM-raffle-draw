import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, AlertCircle, CheckCircle2, Gift } from 'lucide-react';

// Default prizes used for the SVG wheel visuals
const WHEEL_PRIZES = [
  { id: 1, name: "10% OFF Voucher", color: "#18181B", textColor: "#FFFFFF" },
  { id: 2, name: "Free Merchandise", color: "#27272A", textColor: "#FFFFFF" },
  { id: 3, name: "$20 Store Credit", color: "#3F3F46", textColor: "#FFFFFF" },
  { id: 4, name: "Free Shipping", color: "#52525B", textColor: "#FFFFFF" },
  { id: 5, name: "Mystery Prize", color: "#18181B", textColor: "#FFFFFF" },
  { id: 6, name: "25% OFF Voucher", color: "#27272A", textColor: "#FFFFFF" },
  { id: 7, name: "Special Gift Box", color: "#3F3F46", textColor: "#FFFFFF" },
  { id: 8, name: "Better Luck Next Time", color: "#71717A", textColor: "#FFFFFF" }
];

// Wireless mouse 
// 5k discount voucher 
// 10k discount voucher (for 500k above customer )
// Laptop stand 
// Free stickers 
// Try again
// iPhone 17promax (set am nobody can win that one )

export default function App() {
  const [name, setName] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  
  // Status states: 'idle' | 'not_found' | 'already_spun' | 'won'
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [wonData, setWonData] = useState(null);

  // Load saved API URL on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem('raffle_api_url');
    if (savedUrl) setApiUrl(savedUrl);
  }, []);

  // Save Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('raffle_api_url', apiUrl.trim());
    setShowSettings(false);
  };

  // Handle Form Submission & Verification
  const handleVerifyAndSpin = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!apiUrl) {
      setShowSettings(true);
      return;
    }

    setLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch(`${apiUrl}?name=${encodeURIComponent(name.trim())}`);
      const data = await response.json();

      setLoading(false);

      if (data.status === 'success') {
        // Trigger wheel spin
        startWheelSpin(data);
      } else if (data.status === 'already_spun') {
        setStatus('already_spun');
        setErrorMessage("You have already spun the wheel for this order! Thank you for participating.");
      } else {
        setStatus('not_found');
        setErrorMessage("We couldn't find your name in our purchase records. Place an order with us today to join our next draw!");
      }
    } catch (err) {
      setLoading(false);
      setStatus('not_found');
      setErrorMessage("We couldn't find your name in our purchase records. Place an order with us today to join our next draw!");
    }
  };

  // Perform smooth rotation animation to the winning sector
  const startWheelSpin = (data) => {
    setIsSpinning(true);

    // Find matching segment index or default to random sector
    let prizeIndex = WHEEL_PRIZES.findIndex(
      p => p.name.toLowerCase() === (data.prize || '').toLowerCase()
    );
    if (prizeIndex === -1) prizeIndex = Math.floor(Math.random() * WHEEL_PRIZES.length);

    const segmentAngle = 360 / WHEEL_PRIZES.length;
    const segmentCenter = (prizeIndex * segmentAngle) + (segmentAngle / 2);
    
    // 5 full rotations + offset to stop segment at top indicator
    const targetRotation = rotation + (360 * 5) + (360 - segmentCenter);
    
    setRotation(targetRotation);

    // Wait for 4-second animation finish
    setTimeout(() => {
      setIsSpinning(false);
      setWonData(data);
      setStatus('won');
    }, 4200);
  };

  const resetForm = () => {
    setName('');
    setStatus('idle');
    setWonData(null);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      
      {/* Settings Toggle Icon */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="fixed top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 transition rounded-lg"
        aria-label="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Main Container */}
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Company Logo Header */}
        <div className="text-center space-y-2">
          <div className="inline-block p-3 rounded-xl bg-neutral-100 border border-neutral-200">
            {/* Logo Placeholder */}
            <div className="w-12 h-12 flex items-center justify-center font-bold text-xl text-neutral-800 tracking-wider">
              LOGICO
            </div>
          </div>
          <h1 className="text-lg font-semibold text-neutral-900 tracking-tight">Customer Raffle Draw</h1>
        </div>

        {/* Dynamic View Logic */}
        {status === 'won' && wonData ? (
          /* Success / Prize View */
          <div className="text-center space-y-5 animate-fade-in py-2">
            <div className="inline-flex p-3 bg-neutral-100 border border-neutral-200 rounded-full text-neutral-900">
              <Gift className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Congratulations!</p>
              <h2 className="text-2xl font-bold text-neutral-900">{wonData.prize || "10% OFF Voucher"}</h2>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-neutral-600 leading-relaxed">
              Please contact us with your name (<strong>{wonData.name || name}</strong>) to claim your prize!
            </div>

            <button
              onClick={resetForm}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs rounded-xl transition"
            >
              Done
            </button>
          </div>
        ) : (
          /* Main Input & Wheel Form */
          <div className="space-y-6">
            
            {/* Wheel Container */}
            <div className="relative flex items-center justify-center py-2">
              {/* Pointer Indicator */}
              <div className="absolute -top-1 z-10 left-1/2 -translate-x-1/2">
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[16px] border-t-neutral-900" />
              </div>

              {/* Wheel SVG */}
              <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-neutral-900 overflow-hidden shadow-sm relative">
                <div
                  className="w-full h-full rounded-full transition-transform duration-[4000ms] cubic-bezier(0.15, 0.85, 0.2, 1)"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {WHEEL_PRIZES.map((prize, i) => {
                      const total = WHEEL_PRIZES.length;
                      const angle = 360 / total;
                      const start = i * angle;
                      const end = (i + 1) * angle;

                      const x1 = 50 + 50 * Math.cos((Math.PI * start) / 180);
                      const y1 = 50 + 50 * Math.sin((Math.PI * start) / 180);
                      const x2 = 50 + 50 * Math.cos((Math.PI * end) / 180);
                      const y2 = 50 + 50 * Math.sin((Math.PI * end) / 180);

                      const textAngle = start + angle / 2;
                      const textX = 50 + 32 * Math.cos((Math.PI * textAngle) / 180);
                      const textY = 50 + 32 * Math.sin((Math.PI * textAngle) / 180);

                      return (
                        <g key={prize.id}>
                          <path
                            d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                            fill={prize.color}
                            stroke="#FAFAFA"
                            strokeWidth="0.5"
                          />
                          <text
                            x={textX}
                            y={textY}
                            fill={prize.textColor}
                            fontSize="3"
                            fontWeight="500"
                            textAnchor="middle"
                            dominantBaseline="central"
                            transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                            className="select-none pointer-events-none"
                          >
                            {prize.name.length > 12 ? prize.name.slice(0, 10) + '..' : prize.name}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Center Hub */}
                <div className="absolute inset-auto w-10 h-10 bg-white border-2 border-neutral-900 rounded-full flex items-center justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-sm" />
              </div>
            </div>

            {/* Error / Alert Messages */}
            {status === 'not_found' && (
              <div className="p-3.5 bg-neutral-100 border border-neutral-200 rounded-xl flex items-start gap-2.5 text-xs text-neutral-700">
                <AlertCircle className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
            )}

            {status === 'already_spun' && (
              <div className="p-3.5 bg-neutral-100 border border-neutral-200 rounded-xl flex items-start gap-2.5 text-xs text-neutral-700">
                <CheckCircle2 className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
            )}

            {/* Name Input Form */}
            <form onSubmit={handleVerifyAndSpin} className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  disabled={loading || isSpinning}
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (status !== 'idle') setStatus('idle');
                  }}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading || isSpinning || !name.trim()}
                className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white font-medium text-sm rounded-xl transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Verifying...
                  </>
                ) : isSpinning ? (
                  'Spinning...'
                ) : (
                  'Spin Wheel'
                )}
              </button>
            </form>

          </div>
        )}

      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-lg">
            <h3 className="font-semibold text-sm text-neutral-900">Configure Backend API</h3>
            <form onSubmit={handleSaveSettings} className="space-y-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Google Apps Script Web App URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-lg"
                >
                  Save URL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}