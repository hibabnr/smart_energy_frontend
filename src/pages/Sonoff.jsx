import React, { useState, useEffect } from 'react';
import { C } from '../data.js';
import { PageHeader, Card, Btn, DataTable, Badge } from '../components/shared.jsx';
import { api } from '../services/api.js';

const STATUS_LABEL = { online: 'EN LIGNE', offline: 'HORS LIGNE', maintenance: 'MAINT.' };
const STATUS_COLOR = (status) => status === 'online'   ? C.green
                              : status === 'offline'  ? C.red
                              :                          C.orange;

export default function Sonoff() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');           // 👈 nouveau
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ device_id:'', chambre_numero:'', adresse_ip:'' });

  const refresh = () => {
    setLoading(true);
    api.sonoff.getAll()
      .then(setModules)
      .catch(err => alert('Erreur : ' + err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const online      = modules.filter(m => m.status === 'online').length;
  const offline     = modules.filter(m => m.status === 'offline').length;
  const maintenance = modules.filter(m => m.status === 'maintenance').length;
  const dispo       = modules.length > 0 ? Math.round((online / modules.length) * 100) : 0;

  // 👇 Filtre actif appliqué à la liste affichée
  const filteredModules = filter === 'all'
    ? modules
    : modules.filter(m => m.status === filter);

  // 👇 Toggle : reclique sur le même filtre = revient à "all"
  const handleFilterClick = (status) => {
    setFilter(prev => prev === status ? 'all' : status);
  };

  const handleAdd = async () => {
    if (!form.device_id.trim()) return;
    try {
      await api.sonoff.create({
        device_id:      form.device_id.trim(),
        chambre_numero: form.chambre_numero.trim() || null,
        adresse_ip:     form.adresse_ip.trim() || undefined,
      });
      setForm({ device_id:'', chambre_numero:'', adresse_ip:'' });
      setShowAdd(false);
      refresh();
    } catch (err) { alert('Erreur : ' + err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce module ?')) return;
    try {
      await api.sonoff.delete(id);
      setModules(prev => prev.filter(m => m.id !== id));
    } catch (err) { alert('Erreur : ' + err.message); }
  };

  const toggleMaintenance = async (m) => {
    try {
      await api.sonoff.setMaintenance(m.id, m.status !== 'maintenance');
      refresh();
    } catch (err) { alert('Erreur : ' + err.message); }
  };
  const togglePower = async (m) => {
  const isOn = m.power_state === 'ON';
  try {
    await api.sonoff.setPower(m.id, !isOn);
    refresh();
  } catch (err) { alert('Erreur : ' + err.message); }
};

  if (loading) return <div style={{ color:C.muted, padding:40, textAlign:'center', fontSize:13 }}>Chargement...</div>;

  // Cartes KPI cliquables (sauf Disponibilité qui reste statique)
  const kpis = [
    { key:'online',      value: online,      label: 'En ligne',     color: C.green,  clickable: true },
    { key:'offline',     value: offline,     label: 'Hors ligne',   color: C.red,    clickable: true },
    { key:'maintenance', value: maintenance, label: 'Maintenance',  color: C.orange, clickable: true },
    { key:'dispo',       value: dispo + '%', label: 'Disponibilité', color: C.blue,   clickable: false },
  ];

  return (
    <div>
      <PageHeader
        title="Équipements SONOFF"
        sub={
          filter === 'all'
            ? `${modules.length} modules déployés · ${online} en ligne · ${offline} hors ligne`
            : `Filtre : ${STATUS_LABEL[filter]} · ${filteredModules.length} résultat(s)`
        }
        actions={<>
          {filter !== 'all' && <Btn variant="ghost" size="sm" onClick={() => setFilter('all')}>✕ Effacer filtre</Btn>}
          <Btn variant="ghost" size="sm" onClick={refresh}>↻ Mettre à jour</Btn>
          <Btn variant="navy" size="sm" onClick={() => setShowAdd(true)}>+ Ajouter module</Btn>
        </>}
      />

      {/* KPIs cliquables */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        {kpis.map(k => {
          const isActive = filter === k.key;
          return (
            <Card key={k.key}
              onClick={k.clickable ? () => handleFilterClick(k.key) : undefined}
              style={{
                cursor: k.clickable ? 'pointer' : 'default',
                border: isActive ? `2px solid ${k.color}` : `1px solid ${C.border}`,
                background: isActive ? `${k.color}10` : C.card,
                transition: 'all 0.15s',
                position: 'relative',
              }}>
              <div style={{ fontSize:32, fontWeight:800, color:k.color, lineHeight:1 }}>{k.value}</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:6 }}>{k.label}</div>
              {isActive && (
                <div style={{ position:'absolute', top:8, right:10, fontSize:10, fontWeight:700,
                  color:k.color, textTransform:'uppercase', letterSpacing:0.5 }}>● actif</div>
              )}
            </Card>
          );
        })}
      </div>

      <Card pad={0} style={{ overflow:'hidden' }}>
        <DataTable
          columns={[
            { key:'device_id', label:'ID Module', render: (v, row) => (
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <strong style={{ fontFamily:'monospace', color:C.navy }}>{v}</strong>
                {row.is_real && <span title="Données réelles" style={{ fontSize:10 }}>🟢</span>}
              </div>
            )},
            { key:'chambre',    label:'Chambre' },
            { key:'adresse_ip', label:'Adresse IP', render: v => <span style={{ fontFamily:'monospace', fontSize:12, color:C.muted }}>{v}</span> },
            { key:'firmware',   label:'Firmware',   render: v => <span style={{ color:C.green, fontFamily:'monospace', fontSize:12 }}>{v}</span> },
            { key:'status',     label:'État',       render: v => <Badge label={STATUS_LABEL[v]} color={STATUS_COLOR(v)} /> },
            { key:'last_ping',  label:'Dernier ping', render: v => <span style={{ color:C.muted, fontSize:12 }}>{v}</span> },
            { key:'uptime',     label:'Uptime',     render: v => <span style={{ fontSize:12 }}>{v}</span> },
            { key:'signal',     label:'Signal',     render: v => (
              <span style={{ color: v > -55 ? C.green : v > -70 ? C.orange : C.red, fontWeight:600, fontSize:12 }}>
                {v} dBm
              </span>
            )},
          ]}
          rows={filteredModules}                              // 👈 liste filtrée
          actions={row => {
  const isOn = row.power_state === 'ON';
  return (
    <div style={{ display:'flex', gap:5 }}>
      <Btn variant="ghost" size="sm"
        onClick={e => { e.stopPropagation(); togglePower(row); }}
        style={{ color: isOn ? C.red : C.green, fontWeight:700 }}>
        {isOn ? '⏻ Éteindre' : '⏻ Allumer'}
      </Btn>
      <Btn variant="ghost" size="sm"
        onClick={e => { e.stopPropagation(); toggleMaintenance(row); }}>
        {row.status === 'maintenance' ? '↺ Activer' : '🔧 Maint.'}
      </Btn>
      <Btn variant="danger" size="sm"
        onClick={e => { e.stopPropagation(); handleDelete(row.id); }}>✕</Btn>
    </div>
  );
}}
        />
        {filteredModules.length === 0 && (
          <div style={{ padding:'40px 20px', textAlign:'center', color:C.muted, fontSize:13 }}>
            Aucun module ne correspond à ce filtre.
          </div>
        )}
      </Card>

      {/* Modale ajouter */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:200,
          display:'flex', alignItems:'center', justifyContent:'center' }} onClick={() => setShowAdd(false)}>
          <div style={{ background:C.card, borderRadius:16, padding:28, width:400, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Ajouter un module SONOFF</div>
            {[
              { label:'ID module',  key:'device_id',      placeholder:'ex: SNFF-013' },
              { label:'Chambre',    key:'chambre_numero', placeholder:'ex: A-205' },
              { label:'Adresse IP', key:'adresse_ip',     placeholder:'ex: 192.168.1.22' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:5, textTransform:'uppercase' }}>{f.label}</div>
                <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:`1px solid ${C.border}`, fontSize:13, outline:'none', boxSizing:'border-box' }} />
              </div>
            ))}
            <div style={{ display:'flex', gap:10, marginTop:6 }}>
              <Btn variant="ghost" onClick={() => setShowAdd(false)} style={{ flex:1 }}>Annuler</Btn>
              <Btn variant="navy"  onClick={handleAdd} style={{ flex:1 }}>Ajouter</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}