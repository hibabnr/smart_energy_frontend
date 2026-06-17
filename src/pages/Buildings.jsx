import React, { useState, useEffect } from 'react';
import { C } from '../data.js';
import { PageHeader, Card, Btn, FilterBar, DataTable, Badge, StatusDot, LineChart } from '../components/shared.jsx';
import { api } from '../services/api.js';

const EMPTY_BLDG = { name:'', floors:'', rooms:'' };
const EMPTY_ROOM = { numero:'', etage:'', capacite:'3' };

export default function Buildings() {
  const [buildings,    setBuildings]    = useState([]);
  const [rooms,        setRooms]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selBuilding,  setSelBuilding]  = useState(null);
  const [selRoom,      setSelRoom]      = useState(null);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modales
  const [showAddBldg,  setShowAddBldg]  = useState(false);
  const [showAddRoom,  setShowAddRoom]  = useState(false);
  const [editBldg,     setEditBldg]     = useState(null);
  const [editRoom,     setEditRoom]     = useState(null);
  const [formBldg,     setFormBldg]     = useState(EMPTY_BLDG);
  const [formRoom,     setFormRoom]     = useState(EMPTY_ROOM);

  // Résidents
  const [showAddResident,    setShowAddResident]    = useState(false);
  const [availableResidents, setAvailableResidents] = useState([]);

  const reloadRoom = async () => {
    if (!selRoom) return;
    const fresh = await api.buildings.getRoom(selRoom.db_id);
    setSelRoom(fresh);
  };

  const openAddResident = async () => {
    try {
      const list = await api.buildings.getAvailableResidents(selRoom.db_id);
      setAvailableResidents(list);
      setShowAddResident(true);
    } catch (err) { alert('Erreur : ' + err.message); }
  };

  const assignResident = async (residentId) => {
    try {
      await api.buildings.addResident(selRoom.db_id, residentId);
      await reloadRoom();
      setShowAddResident(false);
    } catch (err) { alert('Erreur : ' + err.message); }
  };

  const removeResident = async (residentId) => {
    if (!window.confirm('Retirer ce résident de la chambre ?')) return;
    try {
      await api.buildings.removeResident(selRoom.db_id, residentId);
      await reloadRoom();
    } catch (err) { alert('Erreur : ' + err.message); }
  };

  useEffect(() => { refresh(); }, []);

  const refresh = () => {
    setLoading(true);
    Promise.all([
      api.buildings.getAll().catch(() => []),
      api.buildings.getRooms(null).catch(() => []),
    ])
      .then(([b, r]) => { setBuildings(b); setRooms(r); })
      .catch(err => alert('Erreur chargement : ' + err.message))
      .finally(() => setLoading(false));
  };

  const roomsFor = bid => rooms.filter(r => bid ? r.building === bid : true);
  const filtered = roomsFor(selBuilding?.id).filter(r =>
    (statusFilter === 'all' || r.status === statusFilter) &&
    (search === '' || r.id.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelectRoom = async (room) => {
    try {
      const details = await api.buildings.getRoom(room.db_id);
      setSelRoom(details);
    } catch (err) { alert('Erreur chargement : ' + err.message); }
  };

  const openEditBldg = (b, e) => {
    e?.stopPropagation();
    setFormBldg({ name: b.name, floors: String(b.floors), rooms: String(b.rooms) });
    setEditBldg(b);
  };

  const handleSubmitBldg = async () => {
    if (!formBldg.name.trim()) return;
    try {
      if (editBldg) {
        await api.buildings.update(editBldg.db_id, {
          nom: formBldg.name.trim(),
          nb_etages: parseInt(formBldg.floors) || 1,
          nb_chambres_total: parseInt(formBldg.rooms) || 0,
        });
      } else {
        const code = String.fromCharCode(65 + buildings.length);
        await api.buildings.create({
          code,
          nom: formBldg.name.trim(),
          nb_etages: parseInt(formBldg.floors) || 1,
          nb_chambres_total: parseInt(formBldg.rooms) || 0,
        });
      }
      refresh();
      setFormBldg(EMPTY_BLDG);
      setShowAddBldg(false);
      setEditBldg(null);
    } catch (err) {
      alert((editBldg ? 'Erreur modification : ' : 'Erreur création : ') + err.message);
    }
  };

  const handleDeleteBuilding = async (b, e) => {
    e.stopPropagation();
    if (!window.confirm(`Supprimer ${b.name} et toutes ses chambres ?`)) return;
    try {
      await api.buildings.delete(b.db_id);
      setBuildings(prev => prev.filter(x => x.db_id !== b.db_id));
      setRooms(prev => prev.filter(r => r.building !== b.id));
    } catch (err) { alert('Erreur : ' + err.message); }
  };

  const openEditRoom = (r, e) => {
    e?.stopPropagation();
    setFormRoom({ numero: r.id, etage: String(r.floor || r.etage), capacite: String(r.capacite || 3) });
    setEditRoom(r);
  };

  const handleSubmitRoom = async () => {
    if (!formRoom.numero.trim()) return;
    try {
      if (editRoom) {
        await api.buildings.updateRoom(editRoom.db_id, {
          numero: formRoom.numero.trim(),
          etage: parseInt(formRoom.etage) || 1,
          capacite_max: parseInt(formRoom.capacite) || 3,
        });
      } else {
        await api.buildings.createRoom({
          pavillon_code: selBuilding.id,
          numero: formRoom.numero.trim(),
          etage: parseInt(formRoom.etage) || 1,
          capacite_max: parseInt(formRoom.capacite) || 3,
        });
      }
      refresh();
      setFormRoom(EMPTY_ROOM);
      setShowAddRoom(false);
      setEditRoom(null);
    } catch (err) {
      alert((editRoom ? 'Erreur modification : ' : 'Erreur création : ') + err.message);
    }
  };

  const handleDeleteRoom = async (row, e) => {
    e.stopPropagation();
    if (!window.confirm(`Supprimer la chambre ${row.id} ?`)) return;
    try {
      await api.buildings.deleteRoom(row.db_id);
      setRooms(prev => prev.filter(r => r.db_id !== row.db_id));
    } catch (err) { alert('Erreur : ' + err.message); }
  };

  if (loading) return <div style={{ color:C.muted, padding:40, textAlign:'center', fontSize:13 }}>Chargement...</div>;

  // ═══ VUE DÉTAIL CHAMBRE ════════════════════════════════════════
  if (selRoom) {
    const histKwh    = selRoom.history.map(h => h.puissance_w);   // ← puissance, vraie courbe de charge
const histLabels = selRoom.history.map(h => new Date(h.heure).getHours() + 'h');

    return (
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <Btn variant="ghost" size="sm" onClick={() => setSelRoom(null)}>← Retour</Btn>
          <span style={{ color:C.muted, fontSize:13 }}>/</span>
          <span style={{ fontSize:13, color:C.muted }}>{selRoom.pavillon}</span>
          <span style={{ color:C.muted, fontSize:13 }}>/</span>
          <span style={{ fontSize:13, fontWeight:600, color:C.text }}>Chambre {selRoom.id}</span>
          {selRoom.hasRealData 
            ? <Badge label="🟢 LIVE" color={C.green} />
            : <Badge label="◌ SIMULÉ" color={C.muted} />}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <Card>
            <div style={{ fontSize:12, color:C.muted, marginBottom:12, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>Informations</div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
              <div style={{ width:48, height:48, borderRadius:12, background:C.navy, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700 }}>{selRoom.id.slice(0,3)}</div>
              <div>
                <div style={{ fontSize:15, fontWeight:600 }}>Chambre {selRoom.id}</div>
                <div style={{ fontSize:12, color:C.muted }}>Étage {selRoom.floor} · Capacité {selRoom.capacite}</div>
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderTop:`1px solid ${C.border}` }}>
              <span style={{ fontSize:12, color:C.muted }}>Statut</span>
              <Badge label={selRoom.status.toUpperCase()} 
                color={selRoom.status==='critical'?C.red:selRoom.status==='warning'?C.orange:selRoom.status==='maintenance'?C.muted:C.green} />
            </div>
          </Card>

          <Card>
            <div style={{ fontSize:12, color:C.muted, marginBottom:12, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>Consommation</div>
            <div style={{ fontSize:32, fontWeight:700, color:C.text, marginBottom:8 }}>
  {selRoom.consumption_display}
</div>
            <div style={{ fontSize:11, color:C.muted }}>
              {selRoom.hasRealData ? '🟢 Mesure réelle' : '◌ Simulé'}
            </div>
          </Card>
        </div>

        <Card style={{ marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <span style={{ fontSize:13, fontWeight:600 }}>
              Résidents ({selRoom.residents.length}/{selRoom.capacite})
            </span>
            {selRoom.residents.length < selRoom.capacite && (
              <Btn variant="navy" size="sm" onClick={openAddResident}>+ Ajouter résident</Btn>
            )}
          </div>
          
          {selRoom.residents.length === 0 ? (
            <div style={{ padding:'20px 0', textAlign:'center', color:C.muted, fontSize:13 }}>
              Aucun résident assigné.
            </div>
          ) : selRoom.residents.map(re => (
            <div key={re.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0',
              borderBottom:`1px solid ${C.border}` }}>
              <div style={{ width:36, height:36, borderRadius:10, background:C.blue,
                display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:13 }}>
                {re.name.split(' ').slice(0,2).map(w => w[0]).join('')}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>{re.name}</div>
                <div style={{ fontSize:11, color:C.muted }}>
                  {re.num_etudiant} · {re.filiere || 'Filière inconnue'}
                </div>
              </div>
              <button onClick={() => removeResident(re.id)} 
                title="Retirer de la chambre"
                style={{ background:'transparent', border:'none', cursor:'pointer', 
                         color:C.red, fontSize:14, padding:6 }}>✕</button>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <span style={{ fontSize:13, fontWeight:600 }}>Historique 24h</span>
            <span style={{ fontSize:11, color:C.muted }}>
              {selRoom.hasRealData ? 'Données réelles · capteur Sonoff' : 'Données simulées'}
            </span>
          </div>
          <LineChart data={histKwh} labels={histLabels}
            color={selRoom.status==='critical' ? C.red : C.blue} height={140} />
        </Card>

        {/* Modal — choisir un résident à assigner */}
        {showAddResident && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:200,
            display:'flex', alignItems:'center', justifyContent:'center' }} 
            onClick={() => setShowAddResident(false)}>
            <div style={{ background:C.card, borderRadius:16, padding:24, width:460, maxHeight:'70vh',
              display:'flex', flexDirection:'column', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }} 
              onClick={e => e.stopPropagation()}>
              
              <div style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>
                Assigner un résident à la chambre {selRoom?.id}
              </div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>
                {availableResidents.length} résident(s) sans chambre
              </div>
              
              <div style={{ flex:1, overflow:'auto', marginBottom:14 }}>
                {availableResidents.length === 0 ? (
                  <div style={{ padding:30, textAlign:'center', color:C.muted, fontSize:13 }}>
                    Tous tes résidents sont déjà assignés à une chambre. <br/>
                    Va dans <strong>Utilisateurs</strong> pour en créer un nouveau.
                  </div>
                ) : availableResidents.map(re => (
                  <div key={re.id} 
                    onClick={() => assignResident(re.id)}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', 
                             borderRadius:8, cursor:'pointer', marginBottom:4 }}
                    onMouseEnter={e => e.currentTarget.style.background = C.bg}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width:36, height:36, borderRadius:10, background:C.blue,
                      display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:13 }}>
                      {re.name.split(' ').slice(0,2).map(w => w[0]).join('')}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600 }}>{re.name}</div>
                      <div style={{ fontSize:11, color:C.muted }}>
                        {re.num_etudiant} · {re.filiere || '—'} · {re.annee || ''}
                      </div>
                    </div>
                    <span style={{ fontSize:18, color:C.blue }}>→</span>
                  </div>
                ))}
              </div>
              
              <Btn variant="ghost" onClick={() => setShowAddResident(false)} style={{ width:'100%' }}>
                Annuler
              </Btn>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══ VUE LISTE ═════════════════════════════════════════════════
  return (
    <div>
      <PageHeader
        title={selBuilding ? selBuilding.name : 'Bâtiments & Chambres'}
        sub={selBuilding
  ? `${selBuilding.floors} étages · ${selBuilding.active}/${selBuilding.rooms} chambres · ${selBuilding.consumption_display}`
          : `${buildings.length} bâtiments · ${buildings.reduce((s,b) => s+b.rooms, 0)} chambres au total`}
        actions={selBuilding
          ? <>
              <Btn variant="ghost" size="sm" onClick={() => setSelBuilding(null)}>← Retour</Btn>
              <Btn variant="navy" size="sm" onClick={() => setShowAddRoom(true)}>+ Ajouter chambre</Btn>
            </>
          : <Btn variant="navy" size="sm" onClick={() => setShowAddBldg(true)}>+ Ajouter un bâtiment</Btn>}
      />

      {/* ════ CARDS BÂTIMENTS — SCROLL HORIZONTAL ════ */}
      {!selBuilding && (
        <div style={{ 
          display:'flex', 
          gap:14, 
          marginBottom:24, 
          overflowX:'auto', 
          overflowY:'visible',
          paddingBottom:12,
          // scrollbar plus discrète
          scrollbarWidth:'thin',
          scrollbarColor: `${C.border} transparent`,
        }}>
          {buildings.map(b => (
            <div key={b.id} style={{
              flex: '0 0 200px',                                       // 👈 largeur fixe, pas de shrink
              background:C.card, borderRadius:12, padding:16, position:'relative',
              border:`1.5px solid ${b.status==='alert' ? C.red+'40' : C.border}`,
              cursor:'pointer', transition:'all 0.15s', boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
            }} 
            onClick={() => setSelBuilding(b)}
            onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'; e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.transform='none'; }}
            >
              {/* Boutons ✎ et ✕ */}
              <div style={{ position:'absolute', top:6, right:6, display:'flex', gap:2 }}>
                <button onClick={e => openEditBldg(b, e)}
                  style={{ background:'transparent', border:'none', cursor:'pointer', color:C.muted, fontSize:13, padding:4 }}>✎</button>
                <button onClick={e => handleDeleteBuilding(b, e)}
                  style={{ background:'transparent', border:'none', cursor:'pointer', color:C.muted, fontSize:13, padding:4 }}>✕</button>
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ fontSize:20, fontWeight:800, color: b.status==='alert'?C.red:C.navy }}>{b.id}</div>
                <StatusDot status={b.status} />
              </div>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{b.name}</div>
              <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>{b.floors} étages · {b.active}/{b.rooms} ch.</div>
              <div style={{ fontSize:18, fontWeight:700, color: b.status==='alert'?C.red:C.blue }}>
  {b.consumption_display}
</div>
              <div style={{ display:'flex', gap:4, marginTop:8, fontSize:10, flexWrap:'wrap' }}>
                {b.stats?.alerte > 0    && <span style={{ background:C.red+'20',    color:C.red,    padding:'2px 6px', borderRadius:6 }}>{b.stats.alerte} Alerte</span>}
                {b.stats?.attention > 0 && <span style={{ background:C.orange+'20', color:C.orange, padding:'2px 6px', borderRadius:6 }}>{b.stats.attention} Att.</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display:'flex', gap:10, marginBottom:14, alignItems:'center', flexWrap:'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher chambre..."
          style={{ padding:'8px 14px', borderRadius:8, border:`1px solid ${C.border}`, fontSize:13, outline:'none', width:260 }} />
        <FilterBar
          filters={[
            { value:'all',      label:'Toutes' },
            { value:'critical', label:'Alertes',   count: roomsFor(selBuilding?.id).filter(r=>r.status==='critical').length },
            { value:'warning',  label:'Attention', count: roomsFor(selBuilding?.id).filter(r=>r.status==='warning').length },
            { value:'normal',   label:'Normal',    count: roomsFor(selBuilding?.id).filter(r=>r.status==='normal').length },
          ]}
          active={statusFilter} onChange={setStatusFilter}
        />
        <span style={{ marginLeft:'auto', fontSize:12, color:C.muted }}>{filtered.length} chambre(s)</span>
      </div>

      <Card pad={0} style={{ overflow:'hidden' }}>
        <DataTable
          columns={[
            { key:'id', label:'Chambre', render: (v, row) => (
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <strong>{v}</strong>
                {row.hasRealData && <span title="Capteur connecté" style={{ color:C.green, fontSize:10 }}>🟢</span>}
              </div>
            )},
            { key:'floor', label:'Étage' },
            { key:'consumption', label:'Consommation', render: (v, row) => (
  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
    <strong style={{ color: row.consumption_kwh>3?C.red:row.consumption_kwh>2?C.orange:C.text, minWidth:60 }}>
      {row.consumption_display}
    </strong>
    <div style={{ width:60, height:4, borderRadius:2, background:C.bg }}>
      <div style={{ height:'100%', borderRadius:2, width:`${Math.min(100,(row.consumption_kwh/5)*100)}%`,
        background: row.consumption_kwh>3?C.red:row.consumption_kwh>2?C.orange:C.green }} />
    </div>
  </div>
)},
            { key:'status', label:'État', render: v => (
              <Badge label={v==='critical'?'ALERTE':v==='warning'?'ATTENTION':v==='maintenance'?'MAINT.':'NORMAL'}
                color={v==='critical'?C.red:v==='warning'?C.orange:v==='maintenance'?C.muted:C.green} />
            )},
            { key:'lastActivity', label:'Dernière activité', render: v => <span style={{ color:C.muted, fontSize:12 }}>{v}</span> },
          ]}
          rows={filtered}
          onRowClick={handleSelectRoom}
          actions={row => (
            <div style={{ display:'flex', gap:6 }}>
              <Btn variant="outline" size="sm" onClick={e => { e.stopPropagation(); handleSelectRoom(row); }}>Détail</Btn>
              <Btn variant="ghost"   size="sm" onClick={e => openEditRoom(row, e)}>Modifier</Btn>
              <Btn variant="danger"  size="sm" onClick={e => handleDeleteRoom(row, e)}>✕</Btn>
            </div>
          )}
        />
      </Card>

      {/* MODALE BÂTIMENT */}
      {(showAddBldg || editBldg) && (
        <Modal onClose={() => { setShowAddBldg(false); setEditBldg(null); setFormBldg(EMPTY_BLDG); }}>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>
            {editBldg ? `Modifier ${editBldg.name}` : 'Ajouter un bâtiment'}
          </div>
          {[
            { label:'Nom du bâtiment',   key:'name',   placeholder:'ex: Pavillon F' },
            { label:'Nombre d\'étages',  key:'floors', placeholder:'ex: 4', type:'number' },
            { label:'Nombre de chambres', key:'rooms', placeholder:'ex: 48', type:'number' },
          ].map(f => <Field key={f.key} {...f} value={formBldg[f.key]} onChange={v => setFormBldg(p => ({...p, [f.key]: v}))} />)}
          <Actions
            onCancel={() => { setShowAddBldg(false); setEditBldg(null); setFormBldg(EMPTY_BLDG); }}
            onSubmit={handleSubmitBldg}
            submitLabel={editBldg ? 'Enregistrer' : 'Créer'}
          />
        </Modal>
      )}

      {/* MODALE CHAMBRE */}
      {(showAddRoom || editRoom) && (selBuilding || editRoom) && (
        <Modal onClose={() => { setShowAddRoom(false); setEditRoom(null); setFormRoom(EMPTY_ROOM); }}>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>
            {editRoom ? `Modifier chambre ${editRoom.id}` : `Nouvelle chambre · ${selBuilding?.name}`}
          </div>
          {[
            { label:'Numéro',       key:'numero',   placeholder: editRoom ? editRoom.id : `${selBuilding?.id}-XYZ` },
            { label:'Étage',        key:'etage',    placeholder:'ex: 2', type:'number' },
            { label:'Capacité max', key:'capacite', placeholder:'1 à 3', type:'number' },
          ].map(f => <Field key={f.key} {...f} value={formRoom[f.key]} onChange={v => setFormRoom(p => ({...p, [f.key]: v}))} />)}
          <Actions
            onCancel={() => { setShowAddRoom(false); setEditRoom(null); setFormRoom(EMPTY_ROOM); }}
            onSubmit={handleSubmitRoom}
            submitLabel={editRoom ? 'Enregistrer' : 'Créer'}
          />
        </Modal>
      )}
    </div>
  );
}

// ─── Composants utilitaires ─────────────────────────────────────────
function Modal({ children, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:200,
      display:'flex', alignItems:'center', justifyContent:'center' }} onClick={onClose}>
      <div style={{ background:C.card, borderRadius:16, padding:28, width:400,
        boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type='text' }) {
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:5, textTransform:'uppercase' }}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:`1px solid ${C.border}`,
          fontSize:13, outline:'none', boxSizing:'border-box' }} />
    </div>
  );
}

function Actions({ onCancel, onSubmit, submitLabel }) {
  return (
    <div style={{ display:'flex', gap:10, marginTop:6 }}>
      <Btn variant="ghost" onClick={onCancel} style={{ flex:1 }}>Annuler</Btn>
      <Btn variant="navy"  onClick={onSubmit} style={{ flex:1 }}>{submitLabel}</Btn>
    </div>
  );
}