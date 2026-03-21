export function Spark({ data, color, w = 100, h = 28 }: { data: number[]; color: string; w?: number; h?: number }) {
  const mn = Math.min(...data), mx = Math.max(...data), r = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - 3 - ((v - mn) / r) * (h - 6)}`).join(' ');
  const last = pts.split(' ').pop()!.split(',');
  const lx = parseFloat(last[0]!);
  const ly = parseFloat(last[1]!);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
      <rect x={lx - 2} y={ly - 2} width="4" height="4" fill={color} />
    </svg>
  );
}
