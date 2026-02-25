import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "../../lib/utils";

interface RangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: [number, number];
  onChange?: (value: [number, number]) => void;
  className?: string;
}

export default function RangeSlider({
  min = 0,
  max = 100000,
  step = 1000,
  value = [min, max],
  onChange,
  className,
}: RangeSliderProps) {
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const getPercentage = useCallback(
    (val: number) => ((val - min) / (max - min)) * 100,
    [min, max]
  );

  const updateValue = useCallback(
    (clientX: number, draggingType?: "min" | "max") => {
      if (!sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const newValue = Math.round((min + x * (max - min)) / step) * step;
      const clampedValue = Math.max(min, Math.min(max, newValue));
      const dragType = draggingType || isDragging;

      if (dragType === "min") {
        const newMin = Math.min(clampedValue, localValue[1] - step);
        setLocalValue([newMin, localValue[1]]);
        onChange?.([newMin, localValue[1]]);
      } else if (dragType === "max") {
        const newMax = Math.max(clampedValue, localValue[0] + step);
        setLocalValue([localValue[0], newMax]);
        onChange?.([localValue[0], newMax]);
      }
    },
    [isDragging, min, max, step, localValue, onChange]
  );

  const handleMouseDown = (
    type: "min" | "max",
    e: React.MouseEvent | React.TouchEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(type);
    if ("touches" in e && e.touches[0]) {
      updateValue(e.touches[0].clientX, type);
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      updateValue(clientX);
    },
    [isDragging, updateValue]
  );

  const handleMouseUp = useCallback(() => setIsDragging(null), []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleMouseMove, { passive: false });
      document.addEventListener("touchend", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleMouseMove);
        document.removeEventListener("touchend", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const minPercentage = getPercentage(localValue[0]);
  const maxPercentage = getPercentage(localValue[1]);

  const formatValue = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className="relative h-px rounded-full bg-primary-100"
        ref={sliderRef}
      >
        <div
          className="absolute h-px rounded-full bg-primary-600"
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`,
          }}
        />
        <button
          type="button"
          onMouseDown={(e) => handleMouseDown("min", e)}
          onTouchStart={(e) => handleMouseDown("min", e)}
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary-600 border-2 border-white shadow-lg cursor-grab active:cursor-grabbing hover:bg-primary-700 transition-colors touch-none"
          style={{ left: `calc(${minPercentage}% - 8px)` }}
          aria-label="Min fee"
        />
        <button
          type="button"
          onMouseDown={(e) => handleMouseDown("max", e)}
          onTouchStart={(e) => handleMouseDown("max", e)}
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary-600 border-2 border-white shadow-lg cursor-grab active:cursor-grabbing hover:bg-primary-700 transition-colors touch-none"
          style={{ left: `calc(${maxPercentage}% - 8px)` }}
          aria-label="Max fee"
        />
      </div>
      <div className="flex justify-between text-xs text-neutral-500">
        <span>{formatValue(localValue[0])}</span>
        <span>{formatValue(localValue[1])}</span>
      </div>
    </div>
  );
}
