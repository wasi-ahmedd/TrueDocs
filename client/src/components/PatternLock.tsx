import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PatternLockProps {
    onComplete: (pattern: string) => void;
    error?: boolean;
}

export function PatternLock({ onComplete, error }: PatternLockProps) {
    const [points, setPoints] = useState<number[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const GRID_SIZE = 3;
    const DOT_SIZE = 20;
    const CELL_SIZE = 80;

    // Get coordinates for a dot based on its index
    const getCoords = (index: number) => {
        const row = Math.floor(index / GRID_SIZE);
        const col = index % GRID_SIZE;
        return {
            x: col * CELL_SIZE + CELL_SIZE / 2,
            y: row * CELL_SIZE + CELL_SIZE / 2,
        };
    };

    const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });

    const getIndexFromTouch = (clientX: number, clientY: number) => {
        if (!containerRef.current) return -1;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Check bounds
        if (x < 0 || x > GRID_SIZE * CELL_SIZE || y < 0 || y > GRID_SIZE * CELL_SIZE) return -1;

        const col = Math.floor(x / CELL_SIZE);
        const row = Math.floor(y / CELL_SIZE);
        const index = row * GRID_SIZE + col;

        // Check if close enough to center
        const center = getCoords(index);
        const dist = Math.sqrt(Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2));

        if (dist < 30) return index; // Hit radius
        return -1;
    };

    const handleStart = () => {
        setPoints([]);
        setIsDrawing(true);
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (!isDrawing || !containerRef.current) return;

        // Update SVG line endpoint
        const rect = containerRef.current.getBoundingClientRect();
        setCurrentPos({
            x: clientX - rect.left,
            y: clientY - rect.top
        });

        const index = getIndexFromTouch(clientX, clientY);
        if (index !== -1 && !points.includes(index)) {
            setPoints(prev => [...prev, index]);
        }
    };

    const handleEnd = () => {
        setIsDrawing(false);
        if (points.length > 0) {
            onComplete(points.join(""));
        }
    };

    // Mouse Events
    const onMouseDown = () => handleStart();
    const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleEnd();

    // Touch Events
    const onTouchStart = () => handleStart();
    const onTouchMove = (e: React.TouchEvent) => {
        // Prevent scrolling while drawing pattern
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => handleEnd();

    useEffect(() => {
        const preventScroll = (e: TouchEvent) => {
            if (containerRef.current?.contains(e.target as Node)) {
                e.preventDefault();
            }
        };
        // Non-passive listener for touch move to prevent scrolling
        document.addEventListener('touchmove', preventScroll, { passive: false });
        return () => document.removeEventListener('touchmove', preventScroll);
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative mx-auto touch-none select-none"
            style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {/* Connecting Lines */}
                {points.length > 1 && (
                    <polyline
                        points={points.map(i => {
                            const c = getCoords(i);
                            return `${c.x},${c.y}`;
                        }).join(" ")}
                        fill="none"
                        stroke={error ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}
                {/* Active Line Dragging */}
                {isDrawing && points.length > 0 && (
                    <line
                        x1={getCoords(points[points.length - 1]).x}
                        y1={getCoords(points[points.length - 1]).y}
                        x2={currentPos.x}
                        y2={currentPos.y}
                        stroke={error ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                        strokeWidth="4"
                        strokeLinecap="round"
                        opacity="0.5"
                    />
                )}
            </svg>

            {/* Dots */}
            {Array.from({ length: 9 }).map((_, i) => {
                const { x, y } = getCoords(i);
                const isActive = points.includes(i);
                return (
                    <div
                        key={i}
                        className={cn(
                            "absolute rounded-full transition-all duration-200 pointer-events-none",
                            isActive ? (error ? "bg-destructive scale-125" : "bg-primary scale-125 shadow-lg shadow-primary/30") : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                        )}
                        style={{
                            left: x - DOT_SIZE / 2,
                            top: y - DOT_SIZE / 2,
                            width: DOT_SIZE,
                            height: DOT_SIZE,
                        }}
                    />
                );
            })}
        </div>
    );
}
