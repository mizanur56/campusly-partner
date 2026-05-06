import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  onCancel?: () => void;
  height?: number;
  className?: string;
}

export function SignaturePad({
  onSave,
  onCancel,
  height = 180,
  className = "",
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStroke, setHasStroke] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const getPoint = useCallback((e: React.PointerEvent | PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const draw = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    },
    [],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const point = getPoint(e);
      if (!point) return;
      lastPoint.current = point;
      setIsDrawing(true);
      setHasStroke(true);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    },
    [getPoint],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const point = getPoint(e);
      if (!point || !lastPoint.current) return;
      draw(lastPoint.current, point);
      lastPoint.current = point;
    },
    [isDrawing, getPoint, draw],
  );

  const handlePointerUp = useCallback(() => {
    setIsDrawing(false);
    lastPoint.current = null;
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
  }, []);

  const save = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasStroke) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  }, [hasStroke, onSave]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    const w = parent?.clientWidth ?? 400;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    return () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };
  }, [height]);

  return (
    <div className={className}>
      <div className="rounded-xl border border-primary-border bg-white dark:border-gray-700 dark:bg-gray-900/40">
        <p className="border-b border-primary-border px-3 py-2 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
          Draw your signature in the box below
        </p>
        <canvas
          ref={canvasRef}
          className="block w-full cursor-crosshair touch-none border-b border-primary-border dark:border-gray-800"
          style={{ height: `${height}px`, width: "100%" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        <div className="flex flex-wrap items-center gap-2 px-3 py-3">
          <Button type="button" variant="secondary" size="sm" onClick={clear}>
            Clear
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={save}
            disabled={!hasStroke}
          >
            Save signature
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
