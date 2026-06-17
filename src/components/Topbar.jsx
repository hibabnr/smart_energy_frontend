import React, { useState, useEffect } from 'react';
import { C } from '../data.js';
import { api } from '../services/api.js';

const PAGE_TITLES = {
  dashboard:'Tableau de bord', buildings:'Bâtiments & Chambres',
  alerts:'Alertes & Anomalies', users:'Utilisateurs',
  reports:'Rapports & Statistiques', sonoff:'Équipements SONOFF',
  ai:'Module IA — Détection', settings:'Mon profil',
};

export default function Topbar({ onToggleSidebar, onLogout, onNavigate, currentPage, user }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen,  setUserOpen]  = useState(false);
  const [pending,   setPending]   = useState([]);

  useEffect(() => {
    api.alerts.getPending().then(setPending).catch(() => {});
  }, [currentPage]);

  return (
    <div style={{
      height:58, background:'white', borderBottom:`1px solid ${C.border}`,
      display:'flex', alignItems:'center', padding:'0 20px', gap:14,
      position:'sticky', top:0, zIndex:100, flexShrink:0,
    }}>
      <button onClick={onToggleSidebar}
        style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, padding:4, borderRadius:6, display:'flex', alignItems:'center' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      <div style={{ fontSize:14, fontWeight:600, color:C.text, whiteSpace:'nowrap' }}>
        {PAGE_TITLES[currentPage] || '—'}
      </div>

      <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
        {/* Notifications */}
        <div style={{ position:'relative' }}>
          <button onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); }}
            style={{ position:'relative', background: notifOpen ? `${C.blue}10` : C.bg,
              border:`1px solid ${notifOpen ? C.blue : C.border}`,
              borderRadius:8, padding:'6px 8px', cursor:'pointer',
              display:'flex', alignItems:'center', color:C.muted }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {pending.length > 0 && (
              <span style={{ position:'absolute', top:-4, right:-4, width:16, height:16, borderRadius:'50%',
                background:C.red, color:'white', fontSize:9, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                {pending.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div style={{ position:'absolute', right:0, top:'calc(100% + 8px)',
              background:'white', borderRadius:12, boxShadow:'0 8px 30px rgba(0,0,0,0.12)',
              border:`1px solid ${C.border}`, width:320, zIndex:200 }}>
              <div style={{ padding:'12px 16px', borderBottom:`1px solid ${C.border}`,
                display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:13, fontWeight:700, color:C.text }}>Notifications</span>
                <span style={{ fontSize:11, color:C.blue, cursor:'pointer' }} onClick={() => setNotifOpen(false)}>Fermer</span>
              </div>
              {pending.length === 0 ? (
                <div style={{ padding:24, textAlign:'center', color:C.muted, fontSize:13 }}>Aucune alerte en attente</div>
              ) : pending.slice(0, 4).map(a => (
                <div key={a.id} style={{ padding:'11px 16px', display:'flex', gap:10,
                  borderBottom:`1px solid ${C.border}`, cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bg}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <div style={{ width:8, height:8, borderRadius:'50%', marginTop:4, flexShrink:0,
                    background: a.severity === 'critical' ? C.red : C.orange }} />
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{a.room} — {a.type}</div>
                    <div style={{ fontSize:11, color:C.muted }}>{a.time}</div>
                  </div>
                </div>
              ))}
              {pending.length > 0 && (
                <div style={{ padding:'10px 16px', textAlign:'center', cursor:'pointer' }} 
                     onClick={() => { setNotifOpen(false); onNavigate('alerts'); }}>
                  <span style={{ fontSize:12, color:C.blue }}>Voir toutes les alertes →</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User menu */}
        <div style={{ position:'relative' }}>
          <button onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }}
            style={{ display:'flex', alignItems:'center', gap:8,
              background: userOpen ? `${C.navy}08` : C.bg,
              border:`1px solid ${userOpen ? C.navy : C.border}`,
              borderRadius:8, padding:'5px 10px', cursor:'pointer' }}>
            <div style={{ width:26, height:26, borderRadius:7,
              background:`linear-gradient(135deg,${C.blue},#1a5fa8)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'white', fontSize:10, fontWeight:700 }}>
              {user?.initials || 'DR'}
            </div>
            <span style={{ fontSize:12, fontWeight:600, color:C.text }}>
              {user?.name?.split(' ').slice(-1)[0] || 'Rezgui'}
            </span>
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M1 3l4 4 4-4" stroke={C.muted} strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </button>

          {userOpen && (
            <div style={{ position:'absolute', right:0, top:'calc(100% + 8px)',
              background:'white', borderRadius:12, boxShadow:'0 8px 30px rgba(0,0,0,0.12)',
              border:`1px solid ${C.border}`, width:200, zIndex:200, overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', borderBottom:`1px solid ${C.border}`, background:C.bg }}>
                <div style={{ fontSize:13, fontWeight:700, color:C.text }}>
                  {user?.name || user?.nom || 'Utilisateur'}
                </div>
                <div style={{ fontSize:11, color:C.muted, fontFamily:'monospace' }}>
                  {user?.matricule || user?.email || '—'}
                </div>
              </div>
              <button onClick={() => { setUserOpen(false); onNavigate('settings'); }}
                style={{ display:'flex', alignItems:'center', gap:10, width:'100%',
                padding:'10px 16px', background:'none', border:'none', cursor:'pointer',
                color:C.text, fontSize:13, textAlign:'left' }}
                onMouseEnter={e => e.currentTarget.style.background = C.bg}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                Mon profil
              </button>
              <div style={{ borderTop:`1px solid ${C.border}` }}>
                <button onClick={onLogout}
                  style={{ display:'flex', alignItems:'center', gap:10, width:'100%',
                    padding:'10px 16px', background:'none', border:'none',
                    cursor:'pointer', color:C.red, fontSize:13, textAlign:'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = `${C.red}08`}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}