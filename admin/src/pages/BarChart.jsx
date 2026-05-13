import React, { useRef, useState } from 'react';

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const toDayLabel = (str) => {
  if (!str) return '';
  try {
    let date;
    if (str.includes('-')) {
      date = new Date(str);
    } else {
      const [dd, mm] = str.split('/');
      date = new Date(`${new Date().getFullYear()}-${mm}-${dd}`);
    }
    if (!isNaN(date.getTime())) return DAYS[date.getDay()];
  } catch (_) { }
  return str;
};

const buildTicks = (maxVal) => {
  const ceiling = Math.max(Math.ceil(Math.max(maxVal, 1) / 5) * 5, 10);
  const step = ceiling > 50 ? 20 : (ceiling > 20 ? 10 : 5);
  const ticks = [];
  for (let t = 0; t <= ceiling; t += step) ticks.push(t);
  return { ticks, ceiling };
};

const BarChart = ({ data }) => {
  const svgRef = useRef(null);
  const [hoverIdx, setHoverIdx] = useState(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0, value: null, label: '', date: '' });

  if (!data || data.length === 0) {
    return (
      <div style={{
        height: 220, display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: '#64748b', fontSize: 13,
        background: '#f8fafc', borderRadius: 12, border: '1px dashed #cbd5e1',
      }}>
        Belum ada data untuk ditampilkan
      </div>
    );
  }

  const values = data.map(d => Number(d.total || d.value || 0));
  const labels = data.map(d => toDayLabel(d.label || d.tanggal || ''));
  const rawDates = data.map(d => d.label || d.tanggal || '');

  const maxVal = Math.max(...values, 0);
  const { ticks, ceiling } = buildTicks(maxVal);
  const range = ceiling || 1;

  const W = 500;
  const H = 240;
  const padL = 40;
  const padR = 20;
  const padT = 20;
  const padB = 50; // Increased padding for double labels
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const barCount = values.length;
  const barGap = 10;
  const barW = (plotW / barCount) - barGap;

  const toX = (i) => padL + (i * (plotW / barCount)) + (barGap / 2);
  const toY = (val) => padT + plotH - (val / range) * plotH;

  const handleMove = (e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scale = W / rect.width;
    const px = (e.clientX - rect.left) * scale;

    const idx = Math.floor((px - padL) / (plotW / barCount));
    if (idx >= 0 && idx < values.length) {
      setHoverIdx(idx);
      setTooltip({
        x: toX(idx) + barW / 2,
        y: toY(values[idx]),
        value: values[idx],
        label: labels[idx],
        date: rawDates[idx]
      });
    }
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', display: 'block', overflow: 'visible' }}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* Horizontal Grid Lines */}
        {ticks.map(tick => (
          <g key={tick}>
            <line
              x1={padL} x2={W - padR}
              y1={toY(tick)} y2={toY(tick)}
              stroke="#f1f5f9" strokeWidth="1"
            />
            <text
              x={padL - 10} y={toY(tick)}
              fontSize="10" fill="#94a3b8"
              textAnchor="end" dominantBaseline="middle"
            >
              {tick}
            </text>
          </g>
        ))}

        {/* Bars - Red/Orange Theme (Bos Mentai) */}
        {values.map((v, i) => {
          const x = toX(i);
          const y = toY(v);
          const barH = plotH - (y - padT);
          const active = hoverIdx === i;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(barH, 0)}
                fill={active ? "#ef4444" : "#fca5a5"} // Red Primary
                rx={3}
                style={{ transition: 'all 0.3s ease' }}
              />
              {/* Optional: Value above bar if enough space */}
              {active && v > 0 && (
                <text x={x + barW / 2} y={y - 5} fontSize="10" fill="#ef4444" fontWeight="700" textAnchor="middle">{v}</text>
              )}
            </g>
          );
        })}

        {/* X-Axis Labels (Day + Date) */}
        {labels.map((label, i) => (
          <g key={i}>
            <text
              x={toX(i) + barW / 2}
              y={H - 30}
              fontSize="10"
              fill={hoverIdx === i ? '#ef4444' : '#64748b'}
              textAnchor="middle"
              fontWeight={hoverIdx === i ? '700' : '600'}
            >
              {label}
            </text>
            <text
              x={toX(i) + barW / 2}
              y={H - 15}
              fontSize="9"
              fill="#94a3b8"
              textAnchor="middle"
            >
              {rawDates[i]}
            </text>
          </g>
        ))}

        {/* Vertical Axis Line */}
        <line x1={padL} x2={padL} y1={padT} y2={padT + plotH} stroke="#e2e8f0" strokeWidth="1" />
        {/* Horizontal Baseline */}
        <line x1={padL} x2={W - padR} y1={padT + plotH} y2={padT + plotH} stroke="#cbd5e1" strokeWidth="2" />
      </svg>

      {/* Tooltip */}
      {hoverIdx !== null && (
        <div style={{
          position: 'absolute',
          left: (tooltip.x / W) * 100 + '%',
          top: (tooltip.y / H) * 100 - 10 + '%',
          transform: 'translate(-50%, -100%)',
          background: '#1e293b',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '11px',
          pointerEvents: 'none',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          zIndex: 10,
        }}>
          <div style={{ fontSize: '10px', opacity: 0.7 }}>{tooltip.label}, {tooltip.date}</div>
          <div style={{ fontWeight: 800, color: '#fca5a5', marginTop: 2 }}>{tooltip.value} Menu Terjual</div>
          <div style={{
            position: 'absolute',
            bottom: -4, left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid #1e293b'
          }} />
        </div>
      )}
    </div>
  );
};

export default BarChart;
