import React, { useState, useEffect } from 'react';
import { C } from '../data.js';
import { KpiCard, LineChart, Card, CardHeader, PageHeader, Btn, DataTable, Badge, StatusDot } from '../components/shared.jsx';
import { api } from '../services/api.js';

export default function Dashboard({ onNavigate }) {
  const [period,    setPeriod]    = useState('24h');
  const [chartData, setChartData] = useState(null);
  const [alerts,    setAlerts]    = useState([]);
  const [topRooms,  setTopRooms]  = useState([]);
  const [loading,   setLoading]   = useState(true);

 const [todayConso, setTodayConso] = useState({ today_kwh: 0, trend: 0, last_update: null });

useEffect(() => {
  const load = () => api.consumption.getToday()
    .then(setTodayConso)
    .catch(err => console.warn('Today fetch:', err));
  load();
  const id = setInterval(load, 10000);   // rafraîchit toutes les 10 s
  return () => clearInterval(id);
}, []);

  useEffect(() => {
  Promise.all([
    api.alerts.getAll().catch(() => []),
    api.buildings.getRooms(null).catch(() => []),
  ]).then(([a, r]) => {
    setAlerts(a);
    setTopRooms([...r].sort((x, y) => y.consumption_kwh - x.consumption_kwh).slice(0, 8));
  }).catch(err => {
    console.error('Dashboard fetch error:', err);
  }).finally(() => {
    setLoading(false);  // ← TOUJOURS appelé, même si les APIs échouent
  });
}, []);

 useEffect(() => {
  const load = () => api.consumption.getChart(period)
    .then(setChartData)
    .catch(err => console.warn('Chart fetch error:', err));
  load();
  const id = setInterval(load, 10000);   // rafraîchit toutes les 10 s
  return () => clearInterval(id);
}, [period]);

  const pending = alerts.filter(a => a.status === 'pending').length;
  const today   = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  if (loading) return <div style={{ color:C.muted, padding:40, textAlign:'center', fontSize:13 }}>Chargement...</div>;

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        sub={`Vue d'ensemble · ${today.charAt(0).toUpperCase() + today.slice(1)}`}
        actions={<Btn variant="navy" size="sm" onClick={() => window.print()}>Exporter PDF</Btn>}
      />

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16, marginBottom:20 }}>
       <KpiCard 
  value={`${todayConso.today_wh} Wh`}   // 👈 Wh au lieu de kWh
  label="Énergie consommée aujourd'hui"
  sub={
    todayConso.last_update 
      ? `Mise à jour il y a ${Math.floor((Date.now() - new Date(todayConso.last_update).getTime())/1000)} sec`
      : 'Aucune donnée'
  }
  color={C.blue} 
  trend={todayConso.trend}
  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
/>
        <KpiCard value={`${pending} alertes`} label="En attente de traitement" sub={`${alerts.filter(a=>a.severity==='critical').length} critiques`} color={C.red} trend={12}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg>}/>
      </div>

      {/* Chart */}
      <Card pad={0} style={{ overflow:'hidden', marginBottom:20 }}>
        <CardHeader title="Consommation globale" sub="kWh · Cité universitaire complète"
          actions={
            <div style={{ display:'flex', gap:3 }}>
              {['24h','7j','30j'].map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  padding:'3px 11px', borderRadius:20, border:'none', cursor:'pointer', fontSize:11, fontWeight:600,
                  background: period === p ? C.navy : 'transparent',
                  color: period === p ? 'white' : C.muted, transition:'all 0.2s',
                }}>{p}</button>
              ))}
            </div>
          }
        />
        <div style={{ padding:'14px 16px 10px' }}>
          {chartData && <LineChart data={chartData.data} labels={chartData.labels} height={160} />}
        </div>
      </Card>

      {/* Tables */}
      <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:16 }}>
        <Card pad={0} style={{ overflow:'hidden' }}>
          <CardHeader title="Top chambres consommatrices"
            actions={<span onClick={() => onNavigate('buildings')} style={{ fontSize:11, color:C.blue, cursor:'pointer' }}>Voir tout →</span>} />
          <DataTable
            columns={[
              { key:'id',          label:'Chambre' },
              { key:'building',    label:'Bât.', render: v => <Badge label={`Bât. ${v}`} color={C.teal} /> },
              { key:'consumption', label:'Conso. jour', render: (v, row) => (
  <strong style={{ color: row.consumption_kwh > 3 ? C.red : row.consumption_kwh > 2 ? C.orange : C.text }}>
    {row.consumption_display}
  </strong>
)},
              { key:'status',      label:'État',  render: v => <StatusDot status={v} /> },
            ]}
            rows={topRooms}
          />
        </Card>

        <Card pad={0} style={{ overflow:'hidden' }}>
          <CardHeader title="Alertes récentes"
            actions={<span onClick={() => onNavigate('alerts')} style={{ fontSize:11, color:C.blue, cursor:'pointer' }}>Toutes →</span>} />
          {alerts.slice(0, 6).map((a, i) => (
            <div key={a.id} style={{ padding:'11px 16px', display:'flex', gap:10, alignItems:'flex-start',
              borderBottom: i < 5 ? `1px solid ${C.border}` : 'none', cursor:'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = C.bg}
              onMouseLeave={e => e.currentTarget.style.background = C.card}>
              <div style={{ width:7, height:7, borderRadius:'50%', marginTop:4, flexShrink:0,
                background: a.severity==='critical' ? C.red : a.severity==='warning' ? C.orange : C.teal }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{a.room} · {a.type}</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3, flexShrink:0 }}>
                <span style={{ fontSize:10, color:C.muted }}>{a.time}</span>
                {a.status === 'pending' && <Badge label="EN ATTENTE" color={C.orange} />}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
