import React, { useState, useEffect } from 'react';
import Login    from './components/Login.jsx';
import Sidebar  from './components/Sidebar.jsx';
import Topbar   from './components/Topbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Buildings from './pages/Buildings.jsx';
import Alerts    from './pages/Alerts.jsx';
import Users     from './pages/Users.jsx';
import Reports   from './pages/Reports.jsx';
import Sonoff    from './pages/Sonoff.jsx';
import AI        from './pages/AI.jsx';
import Settings  from './pages/Settings.jsx';
import { getMe, logout as apiLogout, getToken } from './api.js';

const PAGES = {
  dashboard: Dashboard, buildings: Buildings, alerts: Alerts,
  users: Users, reports: Reports, sonoff: Sonoff, ai: AI, settings: Settings,
};

function Shell({ user, onLogout }) {
  const saved = (() => { try { return JSON.parse(localStorage.getItem('cc_admin') || '{}'); } catch { return {}; } })();
  const [page,      setPage]      = useState(saved.page || 'dashboard');
  const [collapsed, setCollapsed] = useState(saved.collapsed || false);

  useEffect(() => {
    localStorage.setItem('cc_admin', JSON.stringify({ page, collapsed }));
  }, [page, collapsed]);

  const PageComponent = PAGES[page] || Dashboard;

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <Sidebar current={page} onNav={setPage} collapsed={collapsed} user={user} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <Topbar
          onToggleSidebar={() => setCollapsed(c => !c)}
          onLogout={onLogout}
          onNavigate={setPage}
          currentPage={page}
          user={user}
        />
        <main style={{ flex:1, overflowY:'auto', padding:'24px 28px' }} key={page} className="page-enter">
          <PageComponent onNavigate={setPage} />
        </main>
      </div>
    </div>
  );
}
function makeUserObject(me) {
  return {
    ...me,
    initials: me.nom ? me.nom.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?',
    name: me.nom,  // alias pour compat
  };
}
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Au démarrage, on vérifie si on a un token valide
  useEffect(() => {
   // Helper pour générer les initiales


async function checkAuth() {
  const token = getToken();
  if (!token) {
    setLoading(false);
    return;
  }
  try {
    const me = await getMe();
    const enriched = makeUserObject(me);
    setUser(enriched);
    localStorage.setItem('cc_user', JSON.stringify(enriched));
  } catch (err) {
    console.warn('Session expirée');
    apiLogout();
  } finally {
    setLoading(false);
  }
}
    checkAuth();
  }, []);
  
 const login = async (u) => {
  // Après login, on récupère le profil complet pour avoir matricule, université, titre, etc.
  try {
    const me = await getMe();
    const enriched = makeUserObject(me);
    localStorage.setItem('cc_user', JSON.stringify(enriched));
    setUser(enriched);
  } catch (err) {
    // Fallback : utiliser ce qu'on a reçu du login
    const enriched = makeUserObject(u);
    localStorage.setItem('cc_user', JSON.stringify(enriched));
    setUser(enriched);
  }
};
  
  const logout = () => {
    apiLogout();
    setUser(null);
  };
  
  if (loading) {
    return (
      <div style={{
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        height:'100vh',
        fontSize: 18,
        color: '#666'
      }}>
        Chargement...
      </div>
    );
  }
  
  return user ? <Shell user={user} onLogout={logout} /> : <Login onLogin={login} />;
}