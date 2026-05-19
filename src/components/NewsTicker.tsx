import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

const NEWS_MESSAGES = [
  "FLIGHT FL8234 ENCOUNTERING TURBULENCE OVER NORTH ATLANTIC",
  "CARGO VESSEL SS MIL-SIN DELAYED DUE TO WEATHER IN SUEZ CANAL",
  "NEW RECORD SET FOR LONGEST COMMERCIAL FLIGHT: LON-SYD",
  "GLOBAL AIR TRAFFIC UP 12% IN LAST 24 HOURS",
  "PORT OF TOKYO UPGRADING TO QUANTUM LOGISTICS SYSTEM",
  "DUBAI HUB EXPANSION: NEW TERMINAL 4 OPENING SOON",
  "SOLAR STORM DETECTED: MINOR NAVIGATION INTERFERENCE POSSIBLE",
];

const NewsTicker: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % NEWS_MESSAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 pointer-events-none">
      <div className="glass px-6 py-2 rounded-full flex items-center gap-4 overflow-hidden border-neon-blue/20">
        <div className="flex items-center gap-2 text-neon-blue shrink-0">
          <AlertCircle size={14} className="animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Network Alert</span>
        </div>
        <div className="h-4 w-[1px] bg-glass shrink-0"></div>
        <div className="relative flex-1 h-4 overflow-hidden">
          <div 
            key={index}
            className="absolute inset-0 text-[10px] font-mono font-bold tracking-tight text-gray-300 animate-in slide-in-from-bottom-2 fade-in"
          >
            {NEWS_MESSAGES[index]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
