interface MiniSparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

export function MiniSparkline({ data, color, width = 120, height = 32 }: MiniSparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pad = 4;
  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (width - pad * 2);
      const y = pad + (1 - (v - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const lastPoint = points.split(' ').pop()!;
  const [cx, cy] = lastPoint.split(',');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x={parseFloat(cx!) - 3} y={parseFloat(cy!) - 3} width="6" height="6" fill={color} />
    </svg>
  );
}
