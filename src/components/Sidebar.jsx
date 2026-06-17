import React from 'react';
import { C } from '../data.js';

const NAV_ITEMS = [
  { id:'dashboard', label:'Tableau de bord',      icon:'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z' },
  { id:'buildings', label:'Bâtiments & Chambres', icon:'M3 22V9l9-6 9 6v13', extra:'M9 22v-8h6v8' },
  { id:'alerts',    label:'Alertes & Anomalies',  icon:'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0', badge:true },
  { id:'users',     label:'Utilisateurs',         icon:'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2', extra:'M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
  // { id:'reports',   label:'Rapports & Stats',     icon:'M18 20V10M12 20V4M6 20v-6' },
  { id:'sonoff',    label:'Équipements SONOFF',   icon:'M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18' },
 { id:'settings',  label:'Mon profil',           icon:'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2', extra:'M12 11a4 4 0 100-8 4 4 0 000 8z' },
];

export default function Sidebar({ current, onNav, collapsed, user, pendingCount = 29 }) {
  return (
    <div style={{
      width: collapsed ? 64 : 230, flexShrink:0, background:C.sidebar,
      height:'100vh', display:'flex', flexDirection:'column',
      transition:'width 0.25s ease', overflow:'hidden', position:'sticky', top:0,
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '18px 0' : '18px 20px',
        display:'flex', alignItems:'center', gap:10,
        borderBottom:'1px solid rgba(255,255,255,0.07)',
        justifyContent: collapsed ? 'center' : 'flex-start', flexShrink:0,
      }}>
        <div style={{ width:32, height:32, borderRadius:8, background:C.blue,
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" />
          </svg>
        </div>
        {!collapsed && (
          <div style={{ overflow:'hidden' }}>
            <div style={{ color:'white', fontSize:13, fontWeight:700, whiteSpace:'nowrap' }}>Electicy</div>
            <div style={{ color:'rgba(255,255,255,0.35)', fontSize:10, whiteSpace:'nowrap' }}>Portail Manager</div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex:1, overflowY:'auto', padding:'10px 8px', overflowX:'hidden' }}>
        {NAV_ITEMS.map(item => {
          const active = current === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)} title={collapsed ? item.label : ''}
              style={{
                display:'flex', alignItems:'center', gap:10, width:'100%',
                padding: collapsed ? '10px 0' : '10px 12px',
                borderRadius:8, border:'none', cursor:'pointer', marginBottom:2,
                background: active ? C.sidebarActive : 'transparent',
                color: active ? 'white' : 'rgba(255,255,255,0.55)',
                transition:'all 0.15s',
                justifyContent: collapsed ? 'center' : 'flex-start',
                position:'relative',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = C.sidebarHover; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}}
            >
              {active && <div style={{ position:'absolute', left:0, top:'20%', bottom:'20%', width:3, borderRadius:2, background:C.blue }} />}
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                <path d={item.icon} />
                {item.extra && <path d={item.extra} />}
              </svg>
              {!collapsed && (
                <span style={{ fontSize:13, fontWeight:active ? 600 : 400, whiteSpace:'nowrap', overflow:'hidden', flex:1, textAlign:'left' }}>
                  {item.label}
                </span>
              )}
              {!collapsed && item.badge && pendingCount > 0 && (
                <span style={{ background:C.red, color:'white', fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:10, flexShrink:0 }}>{pendingCount}</span>
              )}
              {collapsed && item.badge && pendingCount > 0 && (
                <span style={{ position:'absolute', top:6, right:8, width:8, height:8, borderRadius:'50%', background:C.red }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      
       {/* User */}
<div style={{
  padding: collapsed ? '12px 0' : '12px',
  borderTop:'1px solid rgba(255,255,255,0.07)', flexShrink:0,
  display:'flex', alignItems:'center', gap:10,
  justifyContent: collapsed ? 'center' : 'flex-start',
}}>
  <div style={{ width:34, height:34, borderRadius:10,
    background:`linear-gradient(135deg,${C.blue},#1a5fa8)`,
    display:'flex', alignItems:'center', justifyContent:'center',
    color:'white', fontSize:11, fontWeight:700, flexShrink:0 }}>
    {user?.initials || '?'}
  </div>
  {!collapsed && (
    <div style={{ overflow:'hidden', flex:1 }}>
      <div style={{ color:'white', fontSize:12, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
        {user?.name || user?.nom || 'Ahmed Rezgui'}
      </div>
      <div style={{ color:'rgba(255,255,255,0.35)', fontSize:10, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
        {user?.titre || (user?.type_utilisateur === 'DIRECTEUR' ? 'Directeur' : user?.type_utilisateur || '—')}
      </div>
    </div>
  )}
</div>
      </div>
   
  );
}
