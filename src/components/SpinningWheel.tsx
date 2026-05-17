import { motion } from "motion/react";
import { cn } from "../lib/utils";

export interface WheelItem {
  id: string;
  primary: string;
  secondary?: string;
  color: string;
  isAssigned?: boolean;
}

export function SpinningWheel({
  items,
  rotation,
  duration,
  className,
  title,
}: {
  items: WheelItem[];
  rotation: number;
  duration: number;
  className?: string;
  title?: string;
}) {
  const total = items.length;
  const sliceDegree = 360 / total;

  // Generate conic gradient for the wedges
  const conicGradient = items
    .map((item, i) => {
      const start = i * sliceDegree;
      const end = (i + 1) * sliceDegree;
      return `${item.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {title && (
        <h3 className="mb-6 md:mb-10 text-xs md:text-sm font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-2 inline-block">
          {title}
        </h3>
      )}
      <div className="relative w-[280px] h-[280px] md:w-[360px] md:h-[360px] lg:w-[420px] lg:h-[420px]">
        {/* Pointer pointing downwards to the 0 degree mark (Top Center) */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-10 md:w-8 md:h-12 z-30 drop-shadow-[0_4px_10px_rgba(245,158,11,0.5)] flex flex-col items-center">
          <div className="w-full h-full bg-amber-500" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
        </div>
        
        {/* The Wheel Container */}
        <motion.div
           className="w-full h-full rounded-full border-[8px] md:border-[12px] border-[#151515] shadow-[0_0_80px_rgba(0,0,0,0.8),inset_0_0_40px_rgba(0,0,0,1)] overflow-hidden relative"
           animate={{ rotate: rotation }}
           transition={{
              type: "tween",
              ease: [0.1, 0.8, 0.1, 1], // Custom slow-down curve, starting fast
              duration: duration,
           }}
           style={{ background: `conic-gradient(${conicGradient})` }}
        >
           {/* Decorative Lines */}
           <div className="absolute w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: 'repeating-conic-gradient(from 0deg, transparent 0deg 59deg, #d4af37 59deg 60deg)' }} />

           {items.map((item, i) => {
             // Center of the slice (starting from top, 0deg)
             const centerAngle = (i + 0.5) * sliceDegree;
             
             // Base orientation for absolute centering: start from Top-Left, move to center
             // A rotation of 0 points to 3 o'clock (90deg).
             // To align the content with our slice (whose center is at `centerAngle`), 
             // we need to rotate it by `centerAngle - 90`.
             const rotateCorrection = centerAngle - 90;
             
             return (
               <div
                  key={item.id}
                  className={cn(
                    "absolute top-1/2 left-1/2 w-[50%] -translate-y-1/2 origin-left flex items-center pr-4 md:pr-8 pl-4 lg:pl-6 z-10 transition-all duration-700",
                    item.isAssigned ? "opacity-30 grayscale" : "opacity-100 drop-shadow-md text-zinc-300"
                  )}
                  style={{ transform: `rotate(${rotateCorrection}deg)` }}
               >
                  <div className="flex flex-col text-left items-start overflow-hidden w-full pt-0.5">
                    <span className="font-mono font-bold text-[10px] md:text-sm leading-tight truncate w-full tracking-wide text-zinc-300">
                      {item.primary}
                    </span>
                    {item.secondary && (
                      <span className="text-[9px] md:text-xs font-mono font-medium opacity-80 truncate w-full mt-0.5 md:mt-1">
                        {item.secondary}
                      </span>
                    )}
                  </div>
               </div>
             )
           })}
        </motion.div>

        {/* Outer subtle glow */}
        <div className="absolute -inset-4 rounded-full bg-amber-500/5 blur-[50px] pointer-events-none -z-10" />

        {/* Center decorative hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#0a0a0a] border-4 border-amber-600/40 shadow-2xl flex flex-col items-center justify-center z-20">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-amber-600 to-amber-900 shadow-inner" />
        </div>
      </div>
    </div>
  );
}
