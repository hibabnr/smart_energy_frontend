import React from 'react';
import { C } from '../data.js';

// ── BADGE ────────────────────────────────────────────────────
export function Badge({ label, color, size = 'sm' }) {
  const fs = size === 'sm' ? 10 : 12;
  const pad = size === 'sm' ? '2px 8px' : '4px 10px';
  return (
    <span style={{ display:'inline-block', fontSize:fs, fontWeight:600, padding:pad,
      borderRadius:20, background:`${color}18`, color, letterSpacing:0.3, whiteSpace:'nowrap' }}>
      {label}
    </span>
  );
}

// ── STATUS DOT ────────────────────────────────────────────────
export function StatusDot({ status, size = 8 }) {
  const colors = {
    normal: C.green, warning: C.orange, alert: C.red, critical: C.red,
    info: C.teal, resolved: C.muted, online: C.green, offline: C.red,
    maintenance: C.orange, pending: C.orange, archived: C.muted,
  };
  return (
    <span style={{ display:'inline-block', width:size, height:size,
      borderRadius:'50%', background: colors[status] || C.muted, flexShrink:0 }} />
  );
}

// ── KPI CARD ──────────────────────────────────────────────────
export function KpiCard({ value, label, sub, color, trend, icon }) {
  const up = trend > 0, dn = trend < 0;
  return (
    <div style={{ background:C.card, borderRadius:12, padding:20,
      border:`1px solid ${C.border}`, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
        <div style={{ width:42, height:42, borderRadius:10, background:`${color}15`,
          display:'flex', alignItems:'center', justifyContent:'center' }}>{icon}</div>
        {trend !== undefined && (
          <span style={{ fontSize:12, fontWeight:600,
            color: up ? C.red : dn ? C.green : C.muted,
            background: up ? `${C.red}10` : dn ? `${C.green}10` : 'transparent',
            padding:'2px 8px', borderRadius:20 }}>
            {up ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontSize:26, fontWeight:700, color:C.text, lineHeight:1, marginBottom:5 }}>{value}</div>
      <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:2 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:C.muted }}>{sub}</div>}
    </div>
  );
}

// ── SVG LINE CHART ────────────────────────────────────────────
export function LineChart({ data, labels, color = C.blue, height = 150 }) {
  if (!data || data.length < 2) return null;
  const W = 500, H = height, pl = 36, pr = 12, pt = 8, pb = labels ? 22 : 6;
  const iW = W - pl - pr, iH = H - pt - pb;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => [pl + (i / (data.length - 1)) * iW, pt + iH - ((v - min) / range) * iH]);
  const poly = pts.map(([x, y]) => `${x},${y}`).join(' ');
  const area = `M${pl},${pt + iH} ` + pts.map(([x, y]) => `L${x},${y}`).join(' ') + ` L${pl + iW},${pt + iH} Z`;
  const gid = `lg-${color.replace('#', '')}-${height}`;
  const ytks = [0, 0.5, 1].map(t => ({ v: Math.round(min + t * range), y: pt + iH - t * iH }));
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:'block' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {ytks.map(t => (
        <g key={t.v}>
          <line x1={pl} y1={t.y} x2={pl + iW} y2={t.y} stroke={C.border} strokeWidth="1" />
          <text x={pl - 4} y={t.y + 3} textAnchor="end" fontSize="8" fill={C.muted}>{t.v}</text>
        </g>
      ))}
      <path d={area} fill={`url(#${gid})`} />
      <polyline points={poly} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="4" fill={color} stroke="white" strokeWidth="2" />
      {labels && labels.map((l, i) => (
        <text key={l} x={pl + (i / (labels.length - 1)) * iW} y={H - 4} textAnchor="middle" fontSize="9" fill={C.muted}>{l}</text>
      ))}
    </svg>
  );
}

// ── BAR CHART ────────────────────────────────────────────────
export function BarChart({ data, height = 110 }) {
  const W = 500, H = height, pl = 36, pr = 12, pt = 14, pb = 22;
  const iW = W - pl - pr, iH = H - pt - pb;
  const max = Math.max(...data.map(d => d.val)) || 1;
  const bw = Math.min(38, (iW / data.length) * 0.55);
  const gap = iW / data.length;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:'block' }}>
      {[0, 0.5, 1].map(t => {
        const y = pt + iH - t * iH;
        return <line key={t} x1={pl} y1={y} x2={pl + iW} y2={y} stroke={C.border} strokeWidth="1" strokeDasharray="3,3" />;
      })}
      {data.map((d, i) => {
        const bh = Math.max(4, (d.val / max) * iH);
        const x = pl + i * gap + (gap - bw) / 2;
        const y = pt + iH - bh;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={bw} height={bh} fill={d.color || C.blue} rx="4" opacity="0.85" />
            <text x={x + bw / 2} y={y - 4} textAnchor="middle" fontSize="9" fill={C.text} fontWeight="600">{d.val}</text>
            <text x={x + bw / 2} y={H - 5} textAnchor="middle" fontSize="9" fill={C.muted}>{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── DATA TABLE ────────────────────────────────────────────────
export function DataTable({ columns, rows, actions, emptyMsg = 'Aucune donnée', onRowClick }) {
  const [hov, setHov] = React.useState(null);
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
        <thead>
          <tr style={{ background:C.bg, borderBottom:`2px solid ${C.border}` }}>
            {columns.map(c => (
              <th key={c.key} style={{ padding:'10px 14px', textAlign:'left', fontSize:10,
                fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:0.6, whiteSpace:'nowrap' }}>
                {c.label}
              </th>
            ))}
            {actions && <th style={{ padding:'10px 14px', width:160, textAlign:'right' }} />}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)}
                style={{ padding:36, textAlign:'center', color:C.muted }}>{emptyMsg}</td>
            </tr>
          ) : rows.map((row, i) => (
            <tr key={row.id || i}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              onClick={() => onRowClick?.(row)}
              style={{ borderBottom:`1px solid ${C.border}`,
                background: hov === i ? '#EEF2FF' : i % 2 ? '#FAFBFC' : C.card,
                cursor: onRowClick ? 'pointer' : 'default', transition:'background 0.1s' }}>
              {columns.map(c => (
                <td key={c.key} style={{ padding:'11px 14px', verticalAlign:'middle', color:C.text }}>
                  {c.render ? c.render(row[c.key], row) : row[c.key]}
                </td>
              ))}
              {actions && (
                <td style={{ padding:'11px 14px', textAlign:'right',
                  opacity: hov === i ? 1 : 0, transition:'opacity 0.1s' }}>
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── CARD ─────────────────────────────────────────────────────
// Dans shared.jsx, fonction Card
export function Card({ children, pad = 18, onClick, style, ...rest }) {
  return (
    <div onClick={onClick} style={{
      background: C.card, borderRadius: 12, padding: pad,
      border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      ...style,
    }} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, sub, actions }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'14px 18px', borderBottom:`1px solid ${C.border}` }}>
      <div>
        <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{title}</div>
        {sub && <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>{sub}</div>}
      </div>
      {actions && <div style={{ display:'flex', gap:8 }}>{actions}</div>}
    </div>
  );
}

// ── PAGE HEADER ───────────────────────────────────────────────
export function PageHeader({ title, sub, actions }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
      <div>
        <h1 style={{ fontSize:22, fontWeight:700, color:C.text, margin:0, lineHeight:1.2 }}>{title}</h1>
        {sub && <p style={{ fontSize:13, color:C.muted, margin:'4px 0 0' }}>{sub}</p>}
      </div>
      {actions && <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>{actions}</div>}
    </div>
  );
}

// ── BUTTON ───────────────────────────────────────────────────
export function Btn({ children, variant = 'primary', onClick, size = 'md', style: s = {} }) {
  const sizes = { sm:'5px 12px', md:'8px 16px', lg:'11px 22px' };
  const fs = { sm:11, md:13, lg:14 };
  const variants = {
    primary: { background:C.blue,  color:'white',  border:'none', boxShadow:`0 2px 6px ${C.blue}50` },
    ghost:   { background:'transparent', color:C.muted, border:`1px solid ${C.border}` },
    danger:  { background:`${C.red}12`,   color:C.red,   border:`1px solid ${C.red}30` },
    success: { background:`${C.green}12`, color:C.green, border:`1px solid ${C.green}30` },
    outline: { background:'transparent', color:C.blue,  border:`1px solid ${C.blue}` },
    navy:    { background:C.navy,  color:'white',  border:'none' },
  };
  return (
    <button onClick={onClick} style={{ display:'inline-flex', alignItems:'center', gap:6,
      borderRadius:8, cursor:'pointer', fontWeight:600, transition:'all 0.15s',
      padding:sizes[size], fontSize:fs[size], ...variants[variant], ...s }}>
      {children}
    </button>
  );
}

// ── FILTER BAR ────────────────────────────────────────────────
export function FilterBar({ filters, active, onChange }) {
  return (
    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
      {filters.map(f => (
        <button key={f.value} onClick={() => onChange(f.value)} style={{
          padding:'5px 14px', borderRadius:20,
          border:`1px solid ${active === f.value ? C.blue : C.border}`,
          background: active === f.value ? C.blue : 'white',
          color: active === f.value ? 'white' : C.muted,
          fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
        }}>
          {f.label}{f.count !== undefined ? ` (${f.count})` : ''}
        </button>
      ))}
    </div>
  );
}

// ── TOGGLE ───────────────────────────────────────────────────
export function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width:44, height:24, borderRadius:12,
      background: value ? C.green : '#ccc',
      cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0,
    }}>
      <div style={{
        position:'absolute', top:3,
        left: value ? 23 : 3,
        width:18, height:18, borderRadius:'50%',
        background:'white', transition:'left 0.2s',
        boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
}
