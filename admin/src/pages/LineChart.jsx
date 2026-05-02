import React, { useRef, useState } from 'react';

// ─── Konversi "dd/mm" atau "YYYY-MM-DD" → nama hari ────────────────
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const toHariLabel = (str) => {
  if (!str) return '';
  try {
    let date;
    if (str.includes('-')) {
      date = new Date(str);
    } else {
      const [dd, mm] = str.split('/');
      date = new Date(`${new Date().getFullYear()}-${mm}-${dd}`);
    }
    if (!isNaN(date.getTime())) return HARI[date.getDay()];
  } catch (_) {}
  return str;
};

// ─── Y-ticks kelipatan 20, minimal 100 ─────────────────────────────
const buildYTicks = (maxVal) => {
  const ceiling = Math.max(Math.ceil(Math.max(maxVal, 1) / 20) * 20, 100);
  const ticks = [];
  for (let t = 0; t <= ceiling; t += 20) ticks.push(t);
  return { ticks, ceiling };
};

function LineChart({ data }) {
  const svgRef = useRef(null);
  const [hoverIdx, setHoverIdx] = useState(null);
  const [tooltip,  setTooltip]  = useState({ x: 0, y: 0, value: null, label: '' });

  if (!data || data.length === 0) {
    return (
      <div style={{
        height: 200, display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: '#9ca3af', fontSize: 14,
        background: '#fafafa', borderRadius: 8, border: '1px solid #e5e7eb',
      }}>
        Tidak ada data untuk ditampilkan
      </div>
    );
  }

  const values = data.map((d) => d.pesanan ?? d.total ?? 0);
  const labels = data.map((d) => toHariLabel(d.tanggal ?? d.label ?? d.date ?? ''));

  const maxVal             = Math.max(...values, 0);
  const { ticks, ceiling } = buildYTicks(maxVal);
  const range              = ceiling || 1;

  const W     = 420;
  const H     = 200;
  const padL  = 44;
  const padR  = 16;
  const padT  = 16;
  const padB  = 32;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const toX = (i)   => padL + (i / Math.max(values.length - 1, 1)) * plotW;
  const toY = (val) => padT + plotH - (val / range) * plotH;

  const points = values.map((v, i) => [toX(i), toY(v)]);

  const pathD = points
    .map(([x, y], i) =>
      i === 0
        ? `M${x},${y}`
        : `C${(points[i-1][0]+x)/2},${points[i-1][1]} ${(points[i-1][0]+x)/2},${y} ${x},${y}`
    ).join(' ');

  const handleMove = (e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scale = W / rect.width;
    const px    = (e.clientX - rect.left) * scale;
    const best  = points.reduce((b, [x], idx) => {
      const d = Math.abs(x - px);
      return d < b.d ? { d, idx } : b;
    }, { d: Infinity, idx: 0 });
    const [x, y] = points[best.idx];
    setHoverIdx(best.idx);
    setTooltip({ x, y, value: values[best.idx], label: labels[best.idx] });
  };
  const handleLeave = () => { setHoverIdx(null); setTooltip({ value: null }); };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H + padB}`}
      style={{ width: '100%', fontFamily: 'inherit', cursor: 'crosshair', display: 'block' }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {/* Y-axis gridlines + labels */}
      {ticks.map((tick) => {
        const y = toY(tick);
        return (
          <g key={tick}>
            <line
              x1={padL} x2={W - padR} y1={y} y2={y}
              stroke="#e8edf2" strokeWidth="1" strokeDasharray="5 6"
            />
            <text
              x={padL - 8} y={y}
              fontSize="11" fill="#aab4be"
              textAnchor="end" dominantBaseline="middle"
            >
              {tick}
            </text>
          </g>
        );
      })}

      {/* Garis teal halus — tanpa area fill */}
      <path
        d={pathD}
        fill="none"
        stroke="#20b2a0"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dot hanya saat hover */}
      {hoverIdx !== null && points[hoverIdx] && (() => {
        const [x, y] = points[hoverIdx];
        return (
          <g>
            <circle cx={x} cy={y} r={7}   fill="#20b2a0" opacity="0.15" />
            <circle cx={x} cy={y} r={4.5} fill="#fff" stroke="#20b2a0" strokeWidth="2.5" />
            <circle cx={x} cy={y} r={2.5} fill="#20b2a0" />
          </g>
        );
      })()}

      {/* X-axis labels nama hari */}
      {points.map(([x], i) => (
        <text
          key={i}
          x={x} y={H + 18}
          fontSize="11"
          fill={hoverIdx === i ? '#20b2a0' : '#9ca3af'}
          textAnchor="middle"
          fontWeight={hoverIdx === i ? '700' : '400'}
        >
          {labels[i]}
        </text>
      ))}

      {/* Tooltip */}
      {hoverIdx !== null && tooltip.value !== null && (() => {
        const { x, y, value, label } = tooltip;
        const bW = 96, bH = 36;
        const bX = Math.min(Math.max(x - bW / 2, padL), W - padR - bW);
        const bY = Math.max(y - bH - 12, padT);
        return (
          <g>
            <line x1={x} x2={x} y1={padT} y2={padT+plotH}
              stroke="#d1d5db" strokeWidth="1" strokeDasharray="3 3" />
            <rect x={bX} y={bY} width={bW} height={bH} rx={8} fill="#1f2937" opacity="0.92" />
            <text x={bX+bW/2} y={bY+13} fontSize="10" fill="#6ee7e0" textAnchor="middle">{label}</text>
            <text x={bX+bW/2} y={bY+27} fontSize="12" fill="#fff" fontWeight="700" textAnchor="middle">{value} pesanan</text>
          </g>
        );
      })()}

      {/* Axis lines */}
      <line x1={padL} x2={padL}   y1={padT} y2={padT+plotH} stroke="#e8edf2" strokeWidth="1" />
      <line x1={padL} x2={W-padR} y1={padT+plotH} y2={padT+plotH} stroke="#e8edf2" strokeWidth="1" />
    </svg>
  );
}

export default LineChart;
