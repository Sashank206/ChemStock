"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

// Types
export interface ChartDataPoint {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: ChartDataPoint[];
  height?: number;
  color?: "indigo" | "emerald" | "rose" | "amber";
  valueType?: "money" | "number";
  className?: string;
}

interface BarChartProps {
  data: ChartDataPoint[];
  height?: number;
  color?: "indigo" | "emerald" | "rose" | "amber";
  valueType?: "money" | "number";
  className?: string;
}

interface DonutChartProps {
  data: (ChartDataPoint & { color: string })[];
  height?: number;
  valueType?: "money" | "number";
  className?: string;
}

const colorMap = {
  indigo: {
    stroke: "rgb(99, 102, 241)",
    fill: "url(#area-indigo)",
    bar: "fill-indigo-500 dark:fill-indigo-600 hover:fill-indigo-600 dark:hover:fill-indigo-500",
  },
  emerald: {
    stroke: "rgb(16, 185, 129)",
    fill: "url(#area-emerald)",
    bar: "fill-emerald-500 dark:fill-emerald-600 hover:fill-emerald-600 dark:hover:fill-emerald-500",
  },
  rose: {
    stroke: "rgb(244, 63, 94)",
    fill: "url(#area-rose)",
    bar: "fill-rose-500 dark:fill-rose-600 hover:fill-rose-600 dark:hover:fill-rose-500",
  },
  amber: {
    stroke: "rgb(245, 158, 11)",
    fill: "url(#area-amber)",
    bar: "fill-amber-500 dark:fill-amber-600 hover:fill-amber-600 dark:hover:fill-amber-500",
  },
};

const formatChartValue = (value: number, type?: "money" | "number") => {
  if (type === "money") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US").format(value);
};

// 1. AREA CHART COMPONENT
export function AreaChart({
  data,
  height = 200,
  color = "indigo",
  valueType = "number",
  className,
}: AreaChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-slate-500" style={{ height }}>
        No data available
      </div>
    );
  }

  const svgWidth = 500;
  const svgHeight = height;
  const margin = { top: 20, right: 15, bottom: 30, left: 45 };
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 1) * 1.15; // 15% padding on top
  const minValue = 0;

  const getX = (index: number) => {
    if (data.length <= 1) return margin.left + chartWidth / 2;
    return margin.left + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return margin.top + chartHeight - ((val - minValue) / (maxValue - minValue)) * chartHeight;
  };

  // Generate paths
  let linePath = "";
  let areaPath = "";

  if (data.length > 0) {
    const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`);
    linePath = `M ${points.join(" L ")}`;
    areaPath = `${linePath} L ${getX(data.length - 1)},${margin.top + chartHeight} L ${getX(0)},${
      margin.top + chartHeight
    } Z`;
  }

  // Handle gridlines
  const yTicks = 4;
  const yGridValues = Array.from({ length: yTicks }).map(
    (_, i) => minValue + (i * (maxValue - minValue)) / (yTicks - 1)
  );

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full overflow-visible"
        style={{ height }}
      >
        <defs>
          <linearGradient id="area-indigo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="area-emerald" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="area-rose" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(244, 63, 94)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(244, 63, 94)" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="area-amber" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(245, 158, 11)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(245, 158, 11)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yGridValues.map((val, idx) => {
          const y = getY(val);
          return (
            <g key={idx}>
              <line
                x1={margin.left}
                y1={y}
                x2={svgWidth - margin.right}
                y2={y}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeDasharray="4 4"
              />
              <text
                x={margin.left - 10}
                y={y + 4}
                className="fill-slate-400 dark:fill-slate-500 text-[10px] font-medium text-right"
                textAnchor="end"
              >
                {formatChartValue(val, valueType)}
              </text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {data.map((d, i) => {
          const shouldShowLabel =
            data.length <= 7 || i % Math.ceil(data.length / 6) === 0 || i === data.length - 1;
          if (!shouldShowLabel) return null;

          return (
            <text
              key={i}
              x={getX(i)}
              y={svgHeight - 10}
              className="fill-slate-400 dark:fill-slate-500 text-[10px] font-medium"
              textAnchor="middle"
            >
              {d.label}
            </text>
          );
        })}

        {/* Areas */}
        <path d={areaPath} fill={colorMap[color].fill} />
        <path
          d={linePath}
          fill="none"
          stroke={colorMap[color].stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hover elements */}
        {hoveredIdx !== null && (
          <g>
            <line
              x1={getX(hoveredIdx)}
              y1={margin.top}
              x2={getX(hoveredIdx)}
              y2={svgHeight - margin.bottom}
              className="stroke-slate-400 dark:stroke-slate-600"
              strokeDasharray="4 4"
            />
            <circle
              cx={getX(hoveredIdx)}
              cy={getY(data[hoveredIdx].value)}
              r="6"
              fill={colorMap[color].stroke}
              className="stroke-white dark:stroke-slate-900 stroke-2 shadow-lg"
            />
          </g>
        )}

        {/* Overlay for tracking hover */}
        {data.map((_, i) => {
          const x = getX(i);
          const nextX = getX(i + 1);
          const prevX = getX(i - 1);

          let startX = x - (x - prevX) / 2;
          let endX = x + (nextX - x) / 2;

          if (i === 0) {
            startX = margin.left;
            endX = x + (nextX - x) / 2;
          } else if (i === data.length - 1) {
            startX = x - (x - prevX) / 2;
            endX = svgWidth - margin.right;
          }

          return (
            <rect
              key={i}
              x={startX}
              y={margin.top}
              width={Math.max(1, endX - startX)}
              height={chartHeight}
              fill="transparent"
              onMouseEnter={(e) => {
                setHoveredIdx(i);
                if (containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect();
                  const percentX = (getX(i) / svgWidth) * rect.width;
                  const percentY = (getY(data[i].value) / svgHeight) * rect.height;
                  setTooltipPos({ x: percentX, y: percentY });
                }
              }}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredIdx !== null && (
        <div
          className="absolute z-10 p-3 bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-sm text-white rounded-lg shadow-xl text-xs flex flex-col border border-slate-700/50 pointer-events-none transition-all duration-100 ease-out"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 70}px`,
            transform: "translateX(-50%)",
          }}
        >
          <span className="text-slate-400 font-medium mb-0.5">{data[hoveredIdx].label}</span>
          <span className="font-bold text-sm text-indigo-400">
            {formatChartValue(data[hoveredIdx].value, valueType)}
          </span>
        </div>
      )}
    </div>
  );
}

// 2. BAR CHART COMPONENT
export function BarChart({
  data,
  height = 200,
  color = "indigo",
  valueType = "number",
  className,
}: BarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-slate-500" style={{ height }}>
        No data available
      </div>
    );
  }

  const svgWidth = 500;
  const svgHeight = height;
  const margin = { top: 20, right: 15, bottom: 30, left: 45 };
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 1) * 1.15;
  const minValue = 0;

  const barSpacing = data.length > 10 ? 4 : 12;
  const totalSpacing = barSpacing * (data.length - 1);
  const barWidth = (chartWidth - totalSpacing) / data.length;

  const getX = (index: number) => {
    return margin.left + index * (barWidth + barSpacing);
  };

  const getY = (val: number) => {
    return margin.top + chartHeight - ((val - minValue) / (maxValue - minValue)) * chartHeight;
  };

  const getBarHeight = (val: number) => {
    return ((val - minValue) / (maxValue - minValue)) * chartHeight;
  };

  const yTicks = 4;
  const yGridValues = Array.from({ length: yTicks }).map(
    (_, i) => minValue + (i * (maxValue - minValue)) / (yTicks - 1)
  );

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full overflow-visible"
        style={{ height }}
      >
        {/* Grid lines */}
        {yGridValues.map((val, idx) => {
          const y = getY(val);
          return (
            <g key={idx}>
              <line
                x1={margin.left}
                y1={y}
                x2={svgWidth - margin.right}
                y2={y}
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeDasharray="4 4"
              />
              <text
                x={margin.left - 10}
                y={y + 4}
                className="fill-slate-400 dark:fill-slate-500 text-[10px] font-medium"
                textAnchor="end"
              >
                {formatChartValue(val, valueType)}
              </text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {data.map((d, i) => {
          const shouldShowLabel =
            data.length <= 10 || i % Math.ceil(data.length / 8) === 0 || i === data.length - 1;
          if (!shouldShowLabel) return null;

          return (
            <text
              key={i}
              x={getX(i) + barWidth / 2}
              y={svgHeight - 10}
              className="fill-slate-400 dark:fill-slate-500 text-[10px] font-medium"
              textAnchor="middle"
            >
              {d.label}
            </text>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x = getX(i);
          const y = getY(d.value);
          const h = getBarHeight(d.value);

          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(1, h)}
              rx={Math.min(barWidth / 2, 4)}
              className={cn(
                colorMap[color].bar,
                "transition-all duration-200 cursor-pointer ease-in-out"
              )}
              onMouseEnter={(e) => {
                setHoveredIdx(i);
                if (containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect();
                  const percentX = ((x + barWidth / 2) / svgWidth) * rect.width;
                  const percentY = (y / svgHeight) * rect.height;
                  setTooltipPos({ x: percentX, y: percentY });
                }
              }}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredIdx !== null && (
        <div
          className="absolute z-10 p-3 bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-sm text-white rounded-lg shadow-xl text-xs flex flex-col border border-slate-700/50 pointer-events-none transition-all duration-100 ease-out"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 70}px`,
            transform: "translateX(-50%)",
          }}
        >
          <span className="text-slate-400 font-medium mb-0.5">{data[hoveredIdx].label}</span>
          <span className="font-bold text-sm text-indigo-400">
            {formatChartValue(data[hoveredIdx].value, valueType)}
          </span>
        </div>
      )}
    </div>
  );
}

// 3. DONUT CHART COMPONENT
export function DonutChart({
  data,
  height = 200,
  valueType = "number",
  className,
}: DonutChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // SVG Circle details
  const radius = 50;
  const circ = 2 * Math.PI * radius; // ~314.16
  const strokeWidth = 14;
  const center = 80;

  let currentOffset = 0;

  return (
    <div className={cn("flex flex-col sm:flex-row items-center gap-6", className)}>
      <div className="relative" style={{ width: center * 2, height: center * 2 }}>
        <svg
          viewBox={`0 0 ${center * 2} ${center * 2}`}
          width={center * 2}
          height={center * 2}
          className="transform -rotate-90 overflow-visible"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {data.map((item, idx) => {
            const share = item.value / (total || 1);
            const strokeLength = share * circ;
            const strokeOffset = -currentOffset;
            currentOffset += strokeLength;

            const isHovered = hoveredIdx === idx;

            return (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                strokeDasharray={`${strokeLength} ${circ}`}
                strokeDashoffset={strokeOffset}
                className="transition-all duration-200 cursor-pointer ease-out origin-center"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {hoveredIdx !== null ? (
            <>
              <span className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">
                {data[hoveredIdx].label}
              </span>
              <span className="text-xl font-bold text-slate-800 dark:text-white">
                {formatChartValue(data[hoveredIdx].value, valueType)}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {((data[hoveredIdx].value / (total || 1)) * 100).toFixed(0)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">
                Total
              </span>
              <span className="text-2xl font-black text-slate-800 dark:text-white">
                {formatChartValue(total, valueType)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 space-y-2.5 w-full">
        {data.map((item, idx) => {
          const sharePercentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : "0";
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              className={cn(
                "flex items-center justify-between p-2 rounded-lg transition-all duration-150 cursor-pointer",
                isHovered
                  ? "bg-slate-50 dark:bg-slate-800/60 translate-x-1"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
              )}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-900 shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-3 text-right">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatChartValue(item.value, valueType)}
                </span>
                <span className="text-xs text-slate-500 font-medium w-8">
                  {sharePercentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
