import React, { useState, useEffect } from 'react';
import { C } from '../data.js';
import { PageHeader, Card, Btn, DataTable, Badge, StatusDot, LineChart } from '../components/shared.jsx';
import { api } from '../services/api.js';

const ROLE_LABELS = { resident:'Résidents', technician:'Techniciens', admin:'Administrateurs' };
const ROLE_COLOR  = { resident: C.blue,     technician: C.teal,       admin: C.navy };

const EMPTY_FORM = { name:'', email:'', mot_de_passe:'', matricule:'', room:'', role:'resident' };

export default function Users() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('resident');
  const [search,   setSearch]   = useState('');
  const [selUser,  setSelUser]  = useState(null);
  const [showAdd,  setShowAdd]  = useState(false);
  const [editUser, setEditUser] = useState(null);          // 👈 nouveau
  const [form,     setForm]     = useState(EMPTY_FORM);

  useEffect(() => {
    api.users.getAll()
      .then(setUsers)
      .catch(err => alert('Erreur : ' + err.message))
      .finally(() => setLoading(false));
  }, []);
  const [availableRooms, setAvailableRooms] = useState([]);

useEffect(() => {
  api.buildings.getRooms(null)
    .then(rooms => setAvailableRooms(rooms))
    .catch(() => {});
}, []);

  const filtered = users.filter(u =>
    u.role === tab &&
    (search === '' || u.name.toLowerCase().includes(search.toLowerCase()) || u.matricule.includes(search))
  );

  const handleAdd = async () => {
    if (!form.name.trim() || !form.matricule.trim() || !form.mot_de_passe.trim()) return;
    try {
      const created = await api.users.create({
        nom: form.name.trim(), email: form.email.trim(),
        mot_de_passe: form.mot_de_passe.trim(), matricule: form.matricule.trim(),
        chambre: form.room.trim() || null, role: form.role,
      });
      if (created?.id) {
        setUsers(prev => [...prev, created]);
        setTab(form.role);
      }
      setForm(EMPTY_FORM);
      setShowAdd(false);
    } catch (err) {
      alert('Erreur création : ' + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    try {
      const updated = await api.users.update(editUser.id, {
        nom: form.name.trim(), email: form.email.trim(),
        mot_de_passe: form.mot_de_passe.trim() || undefined,   // si vide → pas de changement
        matricule: form.matricule.trim(),
        chambre: form.room.trim() || null,
      });
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      if (selUser?.id === updated.id) setSelUser(updated);
      setEditUser(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      alert('Erreur modification : ' + err.message);
    }
  };

  const openEdit = (user) => {
    setForm({
      name: user.name, email: user.email, mot_de_passe: '',
      matricule: user.matricule === '—' ? '' : user.matricule,
      room: user.room === '—' ? '' : user.room,
      role: user.role,
    });
    setEditUser(user);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer définitivement cet utilisateur ?')) return;
    try {
      await api.users.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      if (selUser?.id === id) setSelUser(null);
    } catch (err) {
      alert('Erreur suppression : ' + err.message);
    }
  };

  if (loading) return <div style={{ color:C.muted, padding:40, textAlign:'center', fontSize:13 }}>Chargement...</div>;

  // Modale partagée (Add + Edit)
  const isEditing = !!editUser;
  const showModal = showAdd || isEditing;

  return (
    <div>
      <PageHeader title="Gestion des utilisateurs"
        sub={`${users.length} comptes · ${users.filter(u=>u.status!=='normal').length} en anomalie`}
        actions={<><Btn variant="ghost" size="sm">📥 Import CSV</Btn><Btn variant="navy" size="sm" onClick={() => setShowAdd(true)}>+ Ajouter</Btn></>}
      />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:20 }}>
        {['resident','technician','admin'].map(r => {
          const count  = users.filter(u => u.role === r).length;
          const alerts = users.filter(u => u.role === r && u.status !== 'normal').length;
          return (
            <div key={r} onClick={() => setTab(r)} style={{
              background: tab===r ? ROLE_COLOR[r] : C.card, borderRadius:12, padding:16,
              border:`1.5px solid ${tab===r ? ROLE_COLOR[r] : C.border}`,
              cursor:'pointer', transition:'all 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontSize:24, fontWeight:700, color: tab===r ? 'white' : C.text }}>{count}</div>
              <div style={{ fontSize:13, fontWeight:600, color: tab===r ? 'rgba(255,255,255,0.9)' : C.text }}>{ROLE_LABELS[r]}</div>
              {alerts > 0 && <div style={{ fontSize:11, color: tab===r ? 'rgba(255,255,255,0.7)' : C.red, marginTop:2 }}>{alerts} en anomalie</div>}
            </div>
          );
        })}
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:14, alignItems:'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Nom, matricule..."
          style={{ padding:'8px 14px', borderRadius:8, border:`1px solid ${C.border}`,
            fontSize:13, outline:'none', width:240, color:C.text }} />
        <span style={{ marginLeft:'auto', fontSize:12, color:C.muted }}>{filtered.length} utilisateur(s)</span>
      </div>

      <Card pad={0} style={{ overflow:'hidden' }}>
        <DataTable
          columns={[
            { key:'initials', label:'', render: (v, row) => (
              <div style={{ width:36, height:36, borderRadius:10,
                background:`linear-gradient(135deg,${ROLE_COLOR[row.role]},${ROLE_COLOR[row.role]}aa)`,
                display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:12, fontWeight:700 }}>{v}</div>
            )},
            { key:'name',      label:'Nom complet', render: v => <strong style={{ fontSize:13 }}>{v}</strong> },
            { key:'matricule', label:'Matricule',   render: v => <span style={{ fontFamily:'monospace', fontSize:12, color:C.muted }}>{v}</span> },
            { key:'room',      label:'Chambre' },
            { key:'date',      label:'Inscription', render: v => <span style={{ fontSize:12, color:C.muted }}>{v}</span> },
           ...(tab === 'resident' ? [{ key:'status', label:'État conso.', render: (v) => (
  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
    <StatusDot status={v} />
    <span style={{ fontSize:12, color:C.muted }}>{v==='alert'?'Alerte':v==='warning'?'Attention':'Normal'}</span>
  </div>
)}] : []),
            ...(tab === 'resident' ? [{ key:'consumption', label:'kWh/j',
              render: v => <strong style={{ color: v>3?C.red:v>2?C.orange:C.text }}>{v}</strong> }] : []),
          ]}
          rows={filtered}
          onRowClick={u => setSelUser(selUser?.id === u.id ? null : u)}
          actions={row => (
            <div style={{ display:'flex', gap:5 }}>
              <Btn variant="outline" size="sm" onClick={e => { e.stopPropagation(); setSelUser(row); }}>Voir</Btn>
              <Btn variant="ghost"   size="sm" onClick={e => { e.stopPropagation(); openEdit(row); }}>Modifier</Btn>
              <Btn variant="danger"  size="sm" onClick={e => { e.stopPropagation(); handleDelete(row.id); }}>✕</Btn>
            </div>
          )}
        />
      </Card>

      {/* ─── Modale Add / Edit (partagée) ─────────────────────── */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:200,
          display:'flex', alignItems:'center', justifyContent:'center' }} 
          onClick={() => { setShowAdd(false); setEditUser(null); setForm(EMPTY_FORM); }}>
          <div style={{ background:C.card, borderRadius:16, padding:28, width:440,
            boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            
            <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:20 }}>
              {isEditing ? `Modifier ${editUser.name}` : 'Ajouter un utilisateur'}
            </div>

            {[
              { label:'Nom complet',  key:'name',         placeholder:'ex: Ahmed Bensalem',     type:'text'     },
              { label:'Email',        key:'email',        placeholder:'ex: a.bensalem@univ.dz', type:'email'    },
              { label: isEditing ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe',
                key:'mot_de_passe', placeholder:'••••••••', type:'password' },
              { label:'Matricule',    key:'matricule',    placeholder:'ex: ETU-2025-001',       type:'text'     },
              { label:'Chambre assignée', key:'room',     placeholder:'ex: A-101',              type:'text'     },
            ].map(f => (
              

<div style={{ marginBottom:14 }}>
  <div style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:5, 
    textTransform:'uppercase', letterSpacing:0.4 }}>Chambre assignée</div>
  <select 
    value={form.room} 
    onChange={e => setForm(prev => ({ ...prev, room: e.target.value }))}
    style={{ width:'100%', padding:'10px 12px', borderRadius:8,
      border:`1px solid ${C.border}`, fontSize:13, outline:'none', 
      background:'white', cursor:'pointer' }}>
    <option value="">— Aucune chambre —</option>
    {availableRooms.map(r => (
      <option key={r.db_id} value={r.id}>
        {r.building} · Chambre {r.id} (Ét. {r.floor})
      </option>
    ))}
  </select>
</div>
            ))}

            {!isEditing && (
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:5, textTransform:'uppercase', letterSpacing:0.4 }}>Rôle</div>
                <select value={form.role} onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:8,
                    border:`1px solid ${C.border}`, fontSize:13, outline:'none', background:'white', cursor:'pointer' }}>
                  <option value="resident">Résident</option>
                  <option value="technician">Technicien</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            )}

            <div style={{ display:'flex', gap:10, marginTop:6 }}>
              <Btn variant="ghost" 
                onClick={() => { setShowAdd(false); setEditUser(null); setForm(EMPTY_FORM); }} 
                style={{ flex:1 }}>Annuler</Btn>
              <Btn variant="navy" 
                onClick={isEditing ? handleUpdate : handleAdd} 
                style={{ flex:1 }}>
                {isEditing ? 'Enregistrer' : 'Créer le compte'}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}