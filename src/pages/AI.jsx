import React, { useState, useEffect } from 'react';
import { C } from '../data.js';
import { PageHeader, Card, KpiCard, Badge } from '../components/shared.jsx';
import { api } from '../services/api.js';

// Mapping backend type → clé frontend (pour l'icône et le filtre)
const TYPE_KEY = {
  APPAREIL_ILLICITE:     'resistance',
  DEPASSEMENT_SEUIL:     'seuil',
  COUPURE_ELECTRIQUE:    'coupure',
  AUTRE:                 'consommation',
};

const TYPE_META = {
  resistance:   { label:'Forte consommation',    color:C.orange },  
  seuil:        { label:'Seuil dépassé',  color:C.red    },
  consommation: { label:'Anomalie',       color:C.blue   },
  coupure:      { label:'Coupure',        color:C.navy   },
};

const ICONS = {
  resistance: col => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round">
      <polyline points="2 12 6 12 7 8 9 16 11 8 13 16 15 8 17 16 18 12 22 12"/>
    </svg>
  ),
  seuil: col => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  consommation: col => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  coupure: col => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
    </svg>
  ),
};

// Détermine la valeur affichée selon le type
const getDisplayValue = (d) => {
  if (d.type_raw === 'COUPURE_ELECTRIQUE') return '—';
  if (d.puissance) return `${d.puissance} W`;
  return d.score ? `${(d.score * 100).toFixed(0)}%` : '—';
};

const getDisplaySeuil = (d) => {
  if (d.type_raw === 'RESISTANCE_CHAUFFANTE' || d.type_raw === 'APPAREIL_ILLICITE') return '2500 W';
  if (d.type_raw === 'DEPASSEMENT_SEUIL') return '2500 W';
  return '—';
};

export default function AI() {
  const [filter, setFilter]         = useState('all');
  const [detections, setDetections] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // Chargement initial
  useEffect(() => {
    async function loadDetections() {
      try {
        setLoading(true);
        const data = await api.alerts.getAll();
        
        // Transformer les données backend → format frontend
        const transformed = data.map(d => ({
          id:        d.id,
          type:      TYPE_KEY[d.type_raw] || 'consommation',
          type_raw:  d.type_raw,
          room:      d.room,
          building:  d.building,
          detail:    d.type,                  // label français : "Résistance chauffante"
          score:     d.score,
          puissance: d.puissance,
          time:      d.time,
          severity:  d.severity,
          status:    d.status,
        }));
        
        setDetections(transformed);
      } catch (err) {
        console.error('Erreur chargement détections:', err);
        setError(err.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }
    loadDetections();
    
    // Auto-refresh toutes les 30 secondes
    const interval = setInterval(loadDetections, 30000);
    return () => clearInterval(interval);
  }, []);

  // Compteurs par type
  const counts = {
    resistance:   detections.filter(d => d.type === 'resistance').length,
    seuil:        detections.filter(d => d.type === 'seuil').length,
    consommation: detections.filter(d => d.type === 'consommation').length,
    coupure:      detections.filter(d => d.type === 'coupure').length,
  };

  // Détections filtrées
  const visible = filter === 'all' ? detections : detections.filter(d => d.type === filter);

  if (loading) {
    return (
      <div>
        <PageHeader title="Module IA" sub="Détection intelligente des anomalies électriques" />
        <Card>
          <div style={{ padding:40, color:C.muted, textAlign:'center' }}>
            🔄 Chargement des détections IA...
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Module IA" sub="Détection intelligente des anomalies électriques" />
        <Card>
          <div style={{ padding:20, color:C.red }}>⚠️ Erreur : {error}</div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Module IA" sub="Détection intelligente des anomalies électriques" />

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
        <KpiCard value={String(counts.resistance)} label="Résistances anormales" sub="Anomalies de résistance" color={C.orange}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2" strokeLinecap="round"><polyline points="2 12 6 12 7 8 9 16 11 8 13 16 15 8 17 16 18 12 22 12"/></svg>}/>
        <KpiCard value={String(counts.seuil)} label="Seuils dépassés" sub="Chambres en dépassement" color={C.red}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}/>
        <KpiCard value={String(counts.consommation)} label="Pics de consommation" sub="Anomalies de conso." color={C.blue}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}/>
        <KpiCard value={String(counts.coupure)} label="Coupures électriques" sub="Incidents détectés" color={C.navy}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>}/>
      </div>

      {/* Liste */}
      <Card pad={0} style={{ overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:C.text }}>Détections en temps réel</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>{detections.length} anomalies détectées (refresh auto 30s)</div>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {[['all','Toutes'],['resistance','Résistance'],['seuil','Seuil'],['consommation','Consommation'],['coupure','Coupure']].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} style={{
                padding:'4px 12px', borderRadius:20,
                border:`1px solid ${filter===k ? C.navy : C.border}`,
                background: filter===k ? C.navy : 'white',
                color: filter===k ? 'white' : C.muted,
                fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.2s',
              }}>{l}</button>
            ))}
          </div>
        </div>

        {visible.length === 0 && (
          <div style={{ padding:40, textAlign:'center', fontSize:13, color:C.muted }}>
            {detections.length === 0 
              ? 'Aucune détection IA pour le moment. Le système surveille en continu.'
              : 'Aucune détection pour ce filtre.'}
          </div>
        )}

        {visible.map((d, i) => {
          const meta = TYPE_META[d.type];
          return (
            <div key={d.id} style={{
              padding:'14px 18px',
              borderBottom: i < visible.length - 1 ? `1px solid ${C.border}` : 'none',
              display:'flex', alignItems:'center', gap:14,
              background: C.card,
            }}>
              <div style={{ width:38, height:38, borderRadius:10, background:`${meta.color}18`,
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {ICONS[d.type](meta.color)}
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3, flexWrap:'wrap' }}>
                  <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{d.room}</span>
                  <span style={{ fontSize:11, color:C.muted }}>({d.building})</span>
                  <Badge label={meta.label} color={meta.color} />
                  {d.severity === 'critical' && <Badge label="CRITIQUE" color={C.red} />}
                  {d.status === 'resolved' && <Badge label="RÉSOLUE" color={C.green} />}
                  {d.status === 'archived' && <Badge label="ARCHIVÉE" color={C.muted} />}
                </div>
                <div style={{ fontSize:12, color:C.muted }}>
                  {d.detail}
                  {d.score && ` — Score IA : ${(d.score * 100).toFixed(0)}%`}
                </div>
              </div>

              <div style={{ textAlign:'right', flexShrink:0, marginRight:12 }}>
                <div style={{ fontSize:16, fontWeight:700, color:d.severity==='critical'?C.red:C.orange }}>
                  {getDisplayValue(d)}
                </div>
                {getDisplaySeuil(d) !== '—' && <div style={{ fontSize:10, color:C.muted }}>seuil : {getDisplaySeuil(d)}</div>}
              </div>

              <div style={{ flexShrink:0 }}>
                <span style={{ fontSize:11, color:C.muted }}>{d.time}</span>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}