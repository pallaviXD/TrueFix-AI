import React, { useState, useRef, useCallback, useEffect } from "react";
import { ChevronsLeftRight, Sparkles } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  aspectRatio?: string;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "BEFORE · REPORTED",
  afterLabel = "AFTER · RESOLVED",
  className = "",
  aspectRatio = "16 / 10",
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className={`slider-container relative select-none overflow-hidden rounded-2xl shadow-xl border border-emerald-950/15 group cursor-ew-resize ${className}`}
      style={{ aspectRatio, touchAction: "none" }}
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIsDragging(false)}
    >
      {/* After image (base layer) */}
      <img
        src={afterImage}
        alt="After resolution"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* After label */}
      <div className="slider-label-after absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-emerald-900/85 backdrop-blur-md text-emerald-100 text-[11px] font-bold tracking-wider uppercase border border-emerald-500/30 shadow-lg flex items-center gap-1.5 pointer-events-none">
        <Sparkles size={12} className="text-emerald-400" />
        {afterLabel}
      </div>

      {/* Before image (clipped layer) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
        }}
      >
        <img
          src={beforeImage}
          alt="Before resolution"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        {/* Before label */}
        <div className="slider-label-before absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-amber-950/85 backdrop-blur-md text-amber-200 text-[11px] font-bold tracking-wider uppercase border border-amber-500/30 shadow-lg pointer-events-none">
          {beforeLabel}
        </div>
      </div>

      {/* Divider line */}
      <div
        className="slider-divider absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] z-20 pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Slider Handle */}
        <div className="slider-handle absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-emerald-900 shadow-2xl flex items-center justify-center border-2 border-emerald-600 transition-transform active:scale-95 group-hover:scale-105">
          <ChevronsLeftRight size={18} strokeWidth={2.5} />
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none z-10">
        <span className="slider-hint px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-medium tracking-wide">
          Drag slider to compare proof
        </span>
      </div>
    </div>
  );
}

export default BeforeAfterSlider;
