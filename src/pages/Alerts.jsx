import React, { useState, useEffect } from 'react';
import { C } from '../data.js';
import { PageHeader, Card, Btn, DataTable, Badge, LineChart } from '../components/shared.jsx';
import { api } from '../services/api.js';

const SEVERITY_MAP = {
  critical: ['CRITIQUE',  C.red],
  warning:  ['HAUTE',     C.orange],
  info:     ['MOYENNE',   C.teal],
};
const STATUS_MAP = { 
  pending:  ['EN ATTENTE', C.orange], 
  resolved: ['RÉSOLUE',    C.green], 
  archived: ['ARCHIVÉE',   C.muted],
};

// Format date complète : "21/05/2026 à 08:42"
const formatFullDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('fr-FR', {
    day:'2-digit', month:'2-digit', year:'numeric',
  }) + ' à ' + date.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
};

export default function Alerts() {
  const [alerts,   setAlerts]   = useState([]);
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [selAlert, setSelAlert] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.alerts.getAll()
      .then(setAlerts)
      .catch(err => alert('Erreur : ' + err.message))
      .finally(() => setLoading(false));
  }, []);

  const resolve = async (id) => {
    try {
      await api.alerts.resolve(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status:'resolved' } : a));
      if (selAlert?.id === id) setSelAlert(prev => ({ ...prev, status:'resolved' }));
    } catch (err) { alert('Erreur : ' + err.message); }
  };

  const exportCSV = () => {
    const header = 'Date,Chambre,Sévérité,Statut';
    const rows   = alerts.map(a => `${formatFullDate(a.raw_date)},${a.room},${a.severity},${a.status}`);
    const blob   = new Blob([[header, ...rows].join('\n')], { type:'text/csv;charset=utf-8;' });
    const url    = URL.createObjectURL(blob);
    const link   = document.createElement('a');
    link.href    = url;
    link.download = `alertes_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // "Total" → reset, autres → toggle
  const handleFilterClick = (key) => {
    if (key === 'total') setFilter('all');
    else setFilter(prev => prev === key ? 'all' : key);
  };

  const filtered = alerts.filter(a => {
    let matchFilter = true;
    if (filter !== 'all') {
      if (['pending','resolved','archived'].includes(filter)) matchFilter = a.status === filter;
      else                                                    matchFilter = a.severity === filter;
    }
    const matchSearch = search === '' 
      || a.room.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    total:    alerts.length,
    pending:  alerts.filter(a => a.status   === 'pending').length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    resolved: alerts.filter(a => a.status   === 'resolved').length,
  };

  const kpis = [
    { key:'total',    value: counts.total,    label: 'Total',      color: C.text },
    { key:'pending',  value: counts.pending,  label: 'En attente', color: C.red },
    { key:'critical', value: counts.critical, label: 'Critiques',  color: C.orange },
    { key:'resolved', value: counts.resolved, label: 'Résolues',   color: C.green },
  ];

  if (loading) return <div style={{ color:C.muted, padding:40, textAlign:'center', fontSize:13 }}>Chargement...</div>;

  return (
    <div>
      <PageHeader title="Alertes & Anomalies" 
        sub={filter === 'all' || filter === 'total' 
          ? "Gestion des incidents énergétiques" 
          : `Filtre : ${(STATUS_MAP[filter]||SEVERITY_MAP[filter])?.[0]} · ${filtered.length} résultat(s)`}
        actions={<>
          {filter !== 'all' && <Btn variant="ghost" size="sm" onClick={() => setFilter('all')}>✕ Effacer filtre</Btn>}
          <Btn variant="ghost" size="sm" onClick={exportCSV}>Exporter CSV</Btn>
          <Btn variant="navy"  size="sm" onClick={() => window.print()}>Rapport auto</Btn>
        </>}
      />

      {/* KPIs cliquables (Total inclus) */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        {kpis.map(k => {
          const isActive = (k.key === 'total' && filter === 'all') || filter === k.key;
          return (
            <Card key={k.key}
              onClick={() => handleFilterClick(k.key)}
              style={{
                cursor: 'pointer',
                border: isActive ? `2px solid ${k.color}` : `1px solid ${C.border}`,
                background: isActive ? `${k.color}10` : C.card,
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
              <span style={{ fontSize:28, fontWeight:800, color:k.color, lineHeight:1 }}>{k.value}</span>
              <span style={{ fontSize:12, color:C.muted }}>{k.label}</span>
              {isActive && <span style={{ marginLeft:'auto', fontSize:10, color:k.color, fontWeight:700 }}>● ACTIF</span>}
            </Card>
          );
        })}
      </div>

      {/* Recherche */}
      <div style={{ display:'flex', gap:10, marginBottom:14, alignItems:'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher chambre..."
          style={{ padding:'8px 14px', borderRadius:8, border:`1px solid ${C.border}`,
            fontSize:13, outline:'none', width:280, color:C.text }} />
        <span style={{ marginLeft:'auto', fontSize:12, color:C.muted }}>{filtered.length} / {alerts.length} alerte(s)</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns: selAlert ? '1fr 380px' : '1fr', gap:16 }}>
        <Card pad={0} style={{ overflow:'hidden' }}>
          <DataTable
            columns={[
              { key:'time', label:'Heure', render: v => (
                <span style={{ fontFamily:'monospace', fontSize:12, color:C.muted }}>{v}</span>
              )},
              { key:'room', label:'Chambre', render: v => <strong style={{ color:C.text }}>{v}</strong> },
              { key:'building', label:'Bâtiment' },
              { key:'severity', label:'Type', render: v => {     // 👈 plus que le badge
                const [label, color] = SEVERITY_MAP[v] || ['—', C.muted];
                return <Badge label={label} color={color} />;
              }},
              { key:'type', label:'Anomalie', render: v => (
  <span style={{ fontSize:12, fontWeight:600,
    color: v === 'Coupure' ? C.red : C.orange }}>
    {v === 'Coupure' ? '🔌 Coupure' : '⚡ Surconso.'}
  </span>
)},
              { key:'status', label:'Statut', render: v => {
                const [l, c] = STATUS_MAP[v] || ['—', C.muted];
                return <Badge label={l} color={c}/>;
              }},
            ]}
            rows={filtered}
            onRowClick={a => setSelAlert(selAlert?.id === a.id ? null : a)}
            actions={null}
          />
          {filtered.length === 0 && (
            <div style={{ padding:'40px 20px', textAlign:'center', color:C.muted, fontSize:13 }}>
              Aucune alerte ne correspond à ce filtre.
            </div>
          )}
        </Card>

        {selAlert && (
          <Card style={{ position:'sticky', top:0, alignSelf:'start' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Détail de l'alerte</div>
              <button onClick={() => setSelAlert(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:16, color:C.muted }}>✕</button>
            </div>

            {/* 👇 Détails sans Type ni Score IA, avec date complète */}
            {[
              ['Chambre',   selAlert.room],
              ['Bâtiment',  selAlert.building],
              ['Sévérité',  (SEVERITY_MAP[selAlert.severity]||[])[0] || selAlert.severity],
              ['Statut',    (STATUS_MAP[selAlert.status]||[])[0]     || selAlert.status],
              ['Date',      formatFullDate(selAlert.raw_date)],
            ].map(([l,v]) => (
              <div key={l} style={{ marginBottom:10 }}>
                <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, marginBottom:3 }}>{l}</div>
                <div style={{ fontSize:13, color:C.text, fontWeight:500 }}>{v}</div>
              </div>
            ))}

            <div style={{ margin:'14px 0', padding:12, background:C.bg, borderRadius:8 }}>
              <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>Signature énergétique</div>
              <LineChart data={Array.from({length:20}, (_, i) => +(Math.sin(selAlert.id + i) * 1.5 + 2).toFixed(1))} color={C.red} height={70} />
            </div>

<div style={{ padding:12, borderRadius:8, background:`${C.blue}08`,
  border:`1px solid ${C.blue}20`, fontSize:12, color:C.muted, textAlign:'center' }}>
   Détection transmise automatiquement au technicien.
</div>
          </Card>
        )}
      </div>
    </div>
  );
}