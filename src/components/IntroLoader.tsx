import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface IntroLoaderProps {
  onComplete: () => void;
}

const IntroLoader: React.FC<IntroLoaderProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => onComplete(), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-emerald-950 flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-yellow/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Logo Animation */}
      <div className={`relative z-10 transition-all duration-1000 ${phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
        <img 
          src="/logos/isotipo2.png" 
          alt="Filtros y Lubricantes" 
          className="w-24 h-24 md:w-32 md:h-32 object-contain mb-6"
        />
      </div>

      {/* Text Animation */}
      <div className={`relative z-10 text-center transition-all duration-1000 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase mb-2">
          Filtros <span className="text-brand-yellow">&</span> Lubricantes
        </h1>
        <p className="text-emerald-400 text-sm md:text-base font-medium tracking-widest uppercase">
          Del Llano S.A.S
        </p>
      </div>

      {/* Loading Bar */}
      <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 w-48 md:w-64 transition-all duration-700 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="h-1 bg-emerald-900/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-yellow rounded-full transition-all duration-[2000ms] ease-out"
            style={{ width: phase >= 3 ? '100%' : '0%' }}
          ></div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-3 text-emerald-400/70">
          <Loader2 size={14} className={`animate-spin ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Cargando...</span>
        </div>
      </div>
    </div>
  );
};

export default IntroLoader;
