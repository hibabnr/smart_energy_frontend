import React, { useState, useEffect } from 'react';
import { C } from '../data.js';
import { PageHeader, Card } from '../components/shared.jsx';
import { getMe } from '../api.js';

const getInitials = (nom) => {
  if (!nom) return '?';
  return nom.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

export default function Settings() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getMe();
        // 👇 FIX 1 : Extraire le profil du wrapper { success, profile }
        const profile = data.profile || data;
        setUser(profile);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const formRow = (label, control, desc) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'14px 0', borderBottom:`1px solid ${C.border}` }}>
      <div style={{ flex:1, marginRight:16 }}>
        <div style={{ fontSize:13, fontWeight:500, color:C.text }}>{label}</div>
        {desc && <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{desc}</div>}
      </div>
      {control}
    </div>
  );

  if (loading) {
    return (
      <div>
        <PageHeader title="Mon profil" sub="Informations de votre compte" />
        <Card><div style={{ padding:20, color:C.muted, textAlign:'center' }}>Chargement du profil...</div></Card>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div>
        <PageHeader title="Mon profil" sub="Informations de votre compte" />
        <Card><div style={{ padding:20, color:C.red }}>⚠️ Erreur : {error || 'Profil introuvable'}</div></Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Mon profil" sub="Informations de votre compte" />

      <Card>
        {/* Avatar + identité */}
        <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:24,
          padding:20, borderRadius:12, background:C.bg, border:`1px solid ${C.border}` }}>
          <div style={{ width:72, height:72, borderRadius:16, background:C.navy, flexShrink:0,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:24, fontWeight:700, color:'white', letterSpacing:1 }}>
            {getInitials(user.nom)}
          </div>
          <div>
            <div style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:4 }}>
              {user.nom}
            </div>
            <div style={{ fontSize:13, color:C.blue, fontWeight:600, marginBottom:4 }}>
              {user.titre || 'Directeur'}
            </div>
            <div style={{ fontSize:11, color:C.muted }}>
              {user.universite || '—'}
            </div>
          </div>
          <div style={{ marginLeft:'auto' }}>
            <span style={{ fontSize:10, fontWeight:700, padding:'4px 12px', borderRadius:20,
              background:`${C.green}15`, color:C.green }}>ACTIF</span>
          </div>
        </div>

        <div style={{ fontSize:15, fontWeight:600, color:C.text, marginBottom:16 }}>
          Informations du compte
        </div>

        {formRow('Matricule',
          <span style={{ fontSize:13, fontWeight:600, color:C.navy, fontFamily:'monospace' }}>
            {user.matricule || '—'}
          </span>,
          'Identifiant unique dans le système'
        )}

        {formRow('Type de compte',
          <span style={{ fontSize:11, fontWeight:700, color:C.navy, padding:'3px 10px',
            background:`${C.navy}10`, borderRadius:6 }}>
            {/* 👇 FIX 2 : role au lieu de type_utilisateur */}
            {user.role || user.type_utilisateur || '—'}
          </span>,
          'Rôle dans la plateforme'
        )}

        {formRow('Université',
          <span style={{ fontSize:13, fontWeight:500, color:C.text }}>
            {user.universite || '—'}
          </span>,
          'Établissement de rattachement'
        )}

        {formRow('Titre',
          <span style={{ fontSize:13, fontWeight:500, color:C.text }}>
            {user.titre || '—'}
          </span>,
          'Fonction occupée dans l\'établissement'
        )}

        {formRow('Date de création du compte',
          <span style={{ fontSize:13, fontWeight:500, color:C.text }}>
            {/* 👇 FIX 2 : createdAt (camelCase) au lieu de created_at */}
            {formatDate(user.createdAt || user.created_at)}
          </span>,
          'Date à laquelle votre compte a été créé'
        )}

        {formRow('Email',
          <span style={{ fontSize:13, fontWeight:500, color:C.text, fontFamily:'monospace' }}>
            {user.email}
          </span>,
          'Adresse utilisée pour les rapports et alertes'
        )}
      </Card>
    </div>
  );
}