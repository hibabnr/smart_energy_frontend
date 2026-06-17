import React, { useState, useEffect } from 'react';
import { C } from '../data.js';
import { PageHeader, Card, CardHeader, Btn, LineChart, DataTable, Badge } from '../components/shared.jsx';
import { api } from '../services/api.js';

const formatEnergy = (kwh) => {
  if (kwh == null || kwh === 0) return '0 Wh';
  if (kwh < 1) return `${(kwh * 1000).toFixed(0)} Wh`;
  return `${kwh.toFixed(2)} kWh`;
};
const formatPower = (w) => {
  if (w == null) return '—';
  if (w < 1000) return `${w.toFixed(1)} W`;
  return `${(w / 1000).toFixed(2)} kW`;
};
const dayLabel = (d) => {
  const date  = new Date(d); date.setHours(0,0,0,0);
  const today = new Date();  today.setHours(0,0,0,0);
  const diff  = Math.round((today - date) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  if (diff === 2) return 'Avant-hier';
  return date.toLocaleDateString('fr-FR', { weekday:'short', day:'2-digit', month:'2-digit' });
};

export default function Reports() {
  const [data,         setData]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [periodFilter, setPeriodFilter] = useState(7);

  const refresh = () => {
    setLoading(true);
    api.reports.getSonoffDetail()
      .then(setData)
      .catch(err => alert('Erreur : ' + err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  if (loading || !data) {
    return <div style={{ color:C.muted, padding:40, textAlign:'center', fontSize:13 }}>Chargement...</div>;
  }

  const { latest, daily_history, recent_measurements } = data;

  // Cas : aucun Sonoff installé
  if (!latest) {
    return (
      <div>
        <PageHeader title="Rapports & Statistiques" sub="Historique de consommation Sonoff" />
        <Card style={{ padding:40, textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>⚡</div>
          <div style={{ fontSize:15, color:C.text, marginBottom:6 }}>Aucune mesure Sonoff disponible</div>
          <div style={{ fontSize:12, color:C.muted }}>Connecte un capteur pour voir les données réelles.</div>
        </Card>
      </div>
    );
  }

  const filteredDays = daily_history.slice(0, periodFilter);
  const chartData   = [...filteredDays].reverse().map(d => +(d.conso_kwh * 1000).toFixed(0));
  const chartLabels = [...filteredDays].reverse().map(d => {
    const x = new Date(d.jour);
    return x.getDate() + '/' + (x.getMonth() + 1);
  });

  const hier = daily_history.find(d => dayLabel(d.jour) === 'Hier');

  return (
    <div>
      <PageHeader 
        title="Rapports & Statistiques" 
        sub={`📍 Chambre ${latest.chambre} (Bât. ${latest.pavillon}) · ${new Date(latest.timestamp).toLocaleString('fr-FR')}`}
        actions={<>
          <Btn variant="ghost" size="sm" onClick={refresh}>↻ Actualiser</Btn>
          <Btn variant="navy"  size="sm" onClick={() => window.print()}>📄 Export PDF</Btn>
        </>}
      />

      {/* ─── 4 KPIs ─── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        {[
          { v: formatEnergy(latest.energie_aujourdhui), l:"Énergie aujourd'hui",   s:'Depuis 00h00',           c:C.blue   },
          { v: formatEnergy(latest.energie_totale),     l:'Énergie totale',        s:'Depuis installation',     c:C.navy   },
          { v: formatPower(latest.puissance_w),         l:'Puissance instantanée', s:`${latest.tension_v.toFixed(0)} V · ${latest.courant_a.toFixed(2)} A`, c:C.orange },
          { v: hier ? formatEnergy(hier.conso_kwh) : '—', l:'Hier',                s: hier ? `Pic ${formatPower(hier.pic_w)}` : 'Aucune donnée', c:C.teal },
        ].map(({v,l,s,c}) => (
          <div key={l} style={{ background:C.card, borderRadius:12, padding:18, border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:24, fontWeight:700, color:c, marginBottom:4 }}>{v}</div>
            <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:2 }}>{l}</div>
            <div style={{ fontSize:11, color:C.muted }}>{s}</div>
          </div>
        ))}
      </div>

      {/* ─── Sélecteur période ─── */}
      <div style={{ display:'flex', gap:6, marginBottom:14, alignItems:'center' }}>
        <span style={{ fontSize:12, color:C.muted, marginRight:8 }}>Période :</span>
        {[{v:7,l:'7 jours'},{v:14,l:'14 jours'},{v:30,l:'30 jours'}].map(p => (
          <button key={p.v} onClick={() => setPeriodFilter(p.v)} style={{
            padding:'6px 14px', borderRadius:20,
            border:`1px solid ${periodFilter===p.v ? C.navy : C.border}`,
            background: periodFilter===p.v ? C.navy : 'white',
            color: periodFilter===p.v ? 'white' : C.muted,
            fontSize:12, fontWeight:600, cursor:'pointer',
          }}>{p.l}</button>
        ))}
      </div>

      {/* ─── Historique jour par jour (graph + tableau côte à côte) ─── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <Card pad={0} style={{ overflow:'hidden' }}>
          <CardHeader title="📊 Consommation journalière" sub={`Énergie (Wh) · ${periodFilter} derniers jours`} />
          <div style={{ padding:'14px 16px 10px' }}>
            {chartData.length > 0 
              ? <LineChart data={chartData} labels={chartLabels} color={C.blue} height={180} />
              : <div style={{ padding:30, textAlign:'center', color:C.muted, fontSize:13 }}>Pas de données pour cette période.</div>
            }
          </div>
        </Card>

        <Card pad={0} style={{ overflow:'hidden' }}>
          <CardHeader title="📅 Historique jour par jour" sub={`${filteredDays.length} jour(s) de mesures`} />
          <div style={{ maxHeight:230, overflow:'auto' }}>
            {filteredDays.length === 0 ? (
              <div style={{ padding:30, textAlign:'center', color:C.muted, fontSize:13 }}>
                Aucun jour à afficher.
              </div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead style={{ background:C.bg, position:'sticky', top:0 }}>
                  <tr>
                    <th style={{ padding:'10px 14px', textAlign:'left', fontWeight:600, color:C.muted, fontSize:10, textTransform:'uppercase', letterSpacing:0.5 }}>Date</th>
                    <th style={{ padding:'10px 14px', textAlign:'left', fontWeight:600, color:C.muted, fontSize:10, textTransform:'uppercase', letterSpacing:0.5 }}>Énergie</th>
                    <th style={{ padding:'10px 14px', textAlign:'left', fontWeight:600, color:C.muted, fontSize:10, textTransform:'uppercase', letterSpacing:0.5 }}>Pic</th>
                    <th style={{ padding:'10px 14px', textAlign:'left', fontWeight:600, color:C.muted, fontSize:10, textTransform:'uppercase', letterSpacing:0.5 }}>Moy.</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDays.map((d, i) => {
                    const label = dayLabel(d.jour);
                    const isToday = label === "Aujourd'hui";
                    return (
                      <tr key={i} style={{ borderBottom:`1px solid ${C.border}`, background: isToday ? `${C.blue}08` : 'transparent' }}>
                        <td style={{ padding:'10px 14px' }}>
                          <strong style={{ color:isToday ? C.blue : C.text, fontSize:12 }}>{label}</strong>
                          <div style={{ fontSize:10, color:C.muted, fontFamily:'monospace' }}>{new Date(d.jour).toLocaleDateString('fr-FR')}</div>
                        </td>
                        <td style={{ padding:'10px 14px' }}>
                          <strong style={{ color: d.conso_kwh > 5 ? C.red : d.conso_kwh > 2 ? C.orange : C.text, fontSize:13 }}>
                            {formatEnergy(d.conso_kwh)}
                          </strong>
                        </td>
                        <td style={{ padding:'10px 14px', color: d.pic_w > 1000 ? C.red : d.pic_w > 500 ? C.orange : C.text }}>
                          {formatPower(d.pic_w)}
                        </td>
                        <td style={{ padding:'10px 14px', color:C.muted }}>
                          {formatPower(d.moyenne_w)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* ─── Mesures temps réel ─── */}
      <Card pad={0} style={{ overflow:'hidden' }}>
        <CardHeader 
          title="🟢 Historique Sonoff temps réel" 
          sub={`${recent_measurements.length} dernières lectures · données brutes du capteur`} 
        />
        {recent_measurements.length === 0 ? (
          <div style={{ padding:30, textAlign:'center', color:C.muted, fontSize:13 }}>
            Aucune mesure encore.
          </div>
        ) : (
          <DataTable
            columns={[
              { key:'timestamp', label:'Date & heure', render: v => (
                <span style={{ fontFamily:'monospace', fontSize:11, color:C.muted }}>
                  {new Date(v).toLocaleString('fr-FR', { 
                    day:'2-digit', month:'2-digit', year:'2-digit',
                    hour:'2-digit', minute:'2-digit', second:'2-digit' 
                  })}
                </span>
              )},
              { key:'chambre', label:'Chambre', render: (v, row) => (
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <Badge label={`Bât. ${row.pavillon}`} color={C.teal}/>
                  <strong style={{ fontSize:12 }}>{v}</strong>
                </div>
              )},
              { key:'puissance_w', label:'Puissance', render: v => (
                <strong style={{ color: v > 1000 ? C.red : v > 500 ? C.orange : C.text }}>{formatPower(v)}</strong>
              )},
              { key:'tension_v', label:'Tension', render: v => <span style={{ color:C.muted, fontSize:12 }}>{v.toFixed(1)} V</span> },
              { key:'courant_a', label:'Courant', render: v => <span style={{ color:C.muted, fontSize:12 }}>{v.toFixed(3)} A</span> },
              { key:'energie_kwh', label:'Énergie jour', render: v => <span>{formatEnergy(v)}</span> },
              { key:'energie_totale_kwh', label:'Total', render: v => <span style={{ fontWeight:600 }}>{formatEnergy(v)}</span> },
              { key:'cos_phi', label:'cos φ', render: v => (
                <span style={{ color: v > 0.9 ? C.green : v > 0.7 ? C.orange : C.red, fontFamily:'monospace', fontSize:12 }}>
                  {v.toFixed(2)}
                </span>
              )},
            ]}
            rows={recent_measurements.map((m, i) => ({ ...m, __key: i }))}
          />
        )}
      </Card>
    </div>
  );
}