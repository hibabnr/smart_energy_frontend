import React, { useState } from 'react';
import { C } from '../data.js';
import { login, register } from '../api.js';

const inp = {
  width:'100%', padding:'10px 13px', borderRadius:9,
  border:`1.5px solid ${C.border}`, fontSize:13, outline:'none', color:C.text,
  transition:'border 0.2s', boxSizing:'border-box', background:'white',
};
const fi = e => e.target.style.borderColor = C.blue;
const bl = e => e.target.style.borderColor = C.border;

// Backend returns { success, user, token } or { erreur }
function extractAuth(data) {
  const token = data.token || data.accessToken;
  const user  = data.user  || data.utilisateur || {};
  return token ? { token, user } : null;
}

const ROLE_OPTIONS = [
  { value:'DIRECTEUR',  label:'Directeur / Admin' },
  { value:'TECHNICIEN', label:'Technicien'          },
  { value:'RESIDENT',   label:'Résident'            },
];

const INIT_REG = {
  nom:'', email:'', mot_de_passe:'', confirm:'',
  type_utilisateur:'DIRECTEUR',
  matricule:'', universite:'', titre:'',
  num_etudiant:'', filiere:'', annee:'',
};

export default function Login({ onLogin }) {
  const [mode,    setMode]    = useState('login');
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState('');
  const [success, setSuccess] = useState('');

  // Login
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');

  // Register
  const [reg, setReg] = useState(INIT_REG);
  const setF = (k, v) => setReg(p => ({ ...p, [k]: v }));

  const switchMode = m => { setMode(m); setErr(''); setSuccess(''); };

  // ── LOGIN ──────────────────────────────────────────────────
  const submitLogin = async (e) => {
    e.preventDefault();
    if (!email || !pass) { setErr('Veuillez remplir tous les champs.'); return; }
    setErr(''); setLoading(true);
    try {
      const data = await login(email, pass);
      const auth = extractAuth(data);
      if (auth) {
         
        onLogin({ ...auth.user, token: auth.token });
      } else {
        setErr(data.erreur || data.message || data.error || 'Identifiants incorrects.');
        setLoading(false);
      }
    } catch (ex) {
      setErr(`Erreur réseau : ${ex.message}. Vérifiez que le backend tourne sur le port 3000.`);
      setLoading(false);
    }
  };

  // ── REGISTER ───────────────────────────────────────────────
  const submitRegister = async (e) => {
    e.preventDefault();
    if (!reg.nom || !reg.email || !reg.mot_de_passe) {
      setErr('Nom, email et mot de passe sont obligatoires.'); return;
    }
    if (reg.mot_de_passe !== reg.confirm) {
      setErr('Les mots de passe ne correspondent pas.'); return;
    }
    if (reg.mot_de_passe.length < 6) {
      setErr('Mot de passe trop court (minimum 6 caractères).'); return;
    }

    // Build payload matching backend schema
    const body = {
      nom:              reg.nom.trim(),
      email:            reg.email.trim(),
      mot_de_passe:     reg.mot_de_passe,
      type_utilisateur: reg.type_utilisateur,
    };

    if (reg.type_utilisateur === 'DIRECTEUR') {
      body.matricule  = reg.matricule.trim();
      body.universite = reg.universite.trim();
      if (reg.titre.trim()) body.titre = reg.titre.trim();
    } else if (reg.type_utilisateur === 'TECHNICIEN') {
      body.matricule  = reg.matricule.trim();
    } else if (reg.type_utilisateur === 'RESIDENT') {
      body.num_etudiant = reg.num_etudiant.trim();
      body.filiere      = reg.filiere.trim();
      body.annee        = parseInt(reg.annee) || null;
      body.universite   = reg.universite.trim();
    }

    setErr(''); setLoading(true);
    try {
      const data = await register(body);
      if (data.success && data.token) {
        // Auto-login after register
        onLogin({ ...data.user, token: data.token });
        return;
      }
      if (data.erreur || data.error) {
        setErr(data.erreur || data.error);
      } else {
        setSuccess('Compte créé ! Vous pouvez vous connecter.');
        setReg(INIT_REG);
        setTimeout(() => switchMode('login'), 1800);
      }
    } catch (ex) {
      setErr(`Erreur réseau : ${ex.message}. Vérifiez que le backend tourne sur le port 3000.`);
    }
    setLoading(false);
  };

  // Extra fields per role
  const extraFields = () => {
    if (reg.type_utilisateur === 'DIRECTEUR') return [
      { label:'Matricule *',   key:'matricule',  ph:'ex: DIR-2024-001',     type:'text'  },
      { label:'Université *',  key:'universite', ph:'ex: Université Constantine 2', type:'text' },
      { label:'Titre',         key:'titre',      ph:'ex: Pr, Dr (optionnel)',type:'text'  },
    ];
    if (reg.type_utilisateur === 'TECHNICIEN') return [
      { label:'Matricule *',   key:'matricule',  ph:'ex: TECH-2024-001',    type:'text'  },
    ];
    if (reg.type_utilisateur === 'RESIDENT') return [
      { label:"N° étudiant *", key:'num_etudiant', ph:'ex: 20240001',       type:'text'  },
      { label:'Filière *',     key:'filiere',    ph:'ex: Informatique',     type:'text'  },
      { label:'Année *',       key:'annee',      ph:'ex: 2',                type:'number'},
      { label:'Université *',  key:'universite', ph:'ex: Université Constantine 2', type:'text' },
    ];
    return [];
  };

  return (
    <div style={{ height:'100vh', display:'grid', gridTemplateColumns:'1.1fr 1fr' }}>

      {/* Left */}
      <div style={{ background:`linear-gradient(145deg,${C.navy} 0%,#0f2448 100%)`,
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        padding:60, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:320, height:320,
          borderRadius:'50%', border:'1px solid rgba(255,255,255,0.06)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-60, left:-60, width:240, height:240,
          borderRadius:'50%', border:'1px solid rgba(255,255,255,0.04)', pointerEvents:'none' }} />
        <svg viewBox="0 0 440 280" style={{ width:'100%', maxWidth:420, marginBottom:40,
          filter:'drop-shadow(0 8px 32px rgba(0,0,0,0.3))' }}>
          <rect width="440" height="280" fill="rgba(255,255,255,0.04)" rx="12" />
          {[[60,40],[120,25],[200,35],[310,20],[380,45]].map(([x,y],i) =>
            <circle key={i} cx={x} cy={y} r="1.5" fill="rgba(255,255,255,0.6)" />)}
          {[[40,130,60,100,'#2E74B5',0.7],[120,100,50,130,'#17A2B8',0.6],
            [190,120,70,110,'#2E74B5',0.8],[280,90,55,140,'#1F6080',0.7],[355,115,65,115,'#17A2B8',0.65]
          ].map(([x,y,w,h,c,o],i) => (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} fill={c} opacity={o} rx="2" />
              {Array.from({length:4},(_,r2) => Array.from({length:2},(_,col) =>
                <rect key={`${r2}-${col}`} x={x+4+col*20} y={y+6+r2*20} width={10} height={8}
                  fill="rgba(255,255,180,0.4)" rx="1" />))}
              <rect x={x+w/2-1} y={y-12} width={2} height={12} fill="rgba(255,255,255,0.4)" />
              <circle cx={x+w/2} cy={y-14} r="2" fill={i===2?'#2ECC71':'rgba(255,100,100,0.8)'} />
            </g>
          ))}
          <rect x="0" y="228" width="440" height="6" fill="rgba(255,255,255,0.08)" />
          {[14,22,30].map(r2 => <circle key={r2} cx={225} cy={120} r={r2} fill="none" stroke="rgba(46,204,113,0.3)" strokeWidth="1.5" />)}
          <circle cx="225" cy="120" r="5" fill="#2ECC71" opacity="0.8" />
        </svg>
        <div style={{ color:'white', fontSize:26, fontWeight:800, letterSpacing:-0.5, marginBottom:8 }}>Electicy</div>
        <div style={{ color:'rgba(255,255,255,0.55)', fontSize:14, lineHeight:1.6, textAlign:'center', maxWidth:340 }}>
          Plateforme de surveillance énergétique intelligente pour la cité universitaire
        </div>
        <div style={{ position:'absolute', bottom:24, color:'rgba(255,255,255,0.2)', fontSize:11 }}>
          Système v2.1.4 · Cité Universitaire · Constantine 2
        </div>
      </div>

      {/* Right */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
        background:'white', padding:'40px 48px', overflowY:'auto' }}>
        <div style={{ width:'100%', maxWidth:380 }}>

          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28 }}>
            <div style={{ width:38, height:38, borderRadius:9, background:C.navy,
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Electicy</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', marginBottom:24, borderRadius:9, overflow:'hidden',
            border:`1px solid ${C.border}` }}>
            {[['login','Connexion'],['register','Créer un compte']].map(([m,label]) => (
              <button key={m} type="button" onClick={() => switchMode(m)} style={{
                flex:1, padding:'9px 0', border:'none', cursor:'pointer', fontSize:12, fontWeight:700,
                background: mode===m ? C.navy : 'white',
                color:      mode===m ? 'white' : C.muted,
                transition:'all 0.18s',
              }}>{label}</button>
            ))}
          </div>

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <form onSubmit={submitLogin}>
              <div style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:4 }}>Connexion</div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:20 }}>Accédez à votre espace de supervision</div>

              <div style={{ marginBottom:13 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:C.muted, marginBottom:5, textTransform:'uppercase', letterSpacing:.4 }}>Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.dz" style={inp} onFocus={fi} onBlur={bl} />
              </div>
              <div style={{ marginBottom:6 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:C.muted, marginBottom:5, textTransform:'uppercase', letterSpacing:.4 }}>Mot de passe</label>
                <input type="password" value={pass} onChange={e => setPass(e.target.value)}
                  placeholder="••••••••" style={inp} onFocus={fi} onBlur={bl} />
              </div>

              <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:18 }}>
                <span style={{ fontSize:12, color:C.blue, cursor:'pointer', fontWeight:500 }}>Mot de passe oublié ?</span>
              </div>

              {err && <div style={{ fontSize:12, color:C.red, marginBottom:12, padding:'9px 12px',
                background:`${C.red}10`, borderRadius:8, lineHeight:1.5 }}>{err}</div>}

              <button type="submit" disabled={loading} style={{
                width:'100%', padding:12, borderRadius:9, border:'none',
                cursor:loading?'not-allowed':'pointer', fontWeight:700, fontSize:14,
                background: loading ? `${C.blue}80` : `linear-gradient(135deg,${C.blue},#1a5fa8)`,
                color:'white', boxShadow:`0 4px 14px ${C.blue}30`, transition:'all 0.2s',
              }}>
                {loading ? 'Connexion...' : 'Se connecter →'}
              </button>
            </form>
          )}

          {/* ── REGISTER ── */}
          {mode === 'register' && (
            <form onSubmit={submitRegister}>
              <div style={{ fontSize:18, fontWeight:800, color:C.text, marginBottom:4 }}>Créer un compte</div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:20 }}>Remplissez les informations ci-dessous</div>

              {/* Type utilisateur en premier pour afficher les bons champs */}
              <div style={{ marginBottom:13 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:700, color:C.muted, marginBottom:5, textTransform:'uppercase', letterSpacing:.4 }}>Type de compte *</label>
                <select value={reg.type_utilisateur} onChange={e => setF('type_utilisateur', e.target.value)}
                  style={{ ...inp, cursor:'pointer' }}>
                  {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {/* Champs communs */}
              {[
                { label:'Nom complet *',  key:'nom',          ph:'ex: Ahmed Bensalem',      type:'text'     },
                { label:'Email *',        key:'email',        ph:'votre@email.dz',           type:'email'    },
                { label:'Mot de passe *', key:'mot_de_passe', ph:'Min. 6 caractères',        type:'password' },
                { label:'Confirmer *',    key:'confirm',      ph:'Répétez le mot de passe',  type:'password' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom:13 }}>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:C.muted, marginBottom:5, textTransform:'uppercase', letterSpacing:.4 }}>{f.label}</label>
                  <input type={f.type} value={reg[f.key]}
                    onChange={e => setF(f.key, e.target.value)}
                    placeholder={f.ph} style={inp} onFocus={fi} onBlur={bl} />
                </div>
              ))}

              {/* Champs spécifiques au rôle */}
              {extraFields().map(f => (
                <div key={f.key} style={{ marginBottom:13 }}>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:C.muted, marginBottom:5, textTransform:'uppercase', letterSpacing:.4 }}>{f.label}</label>
                  <input type={f.type} value={reg[f.key]}
                    onChange={e => setF(f.key, e.target.value)}
                    placeholder={f.ph} style={inp} onFocus={fi} onBlur={bl} />
                </div>
              ))}

              {err     && <div style={{ fontSize:12, color:C.red,   marginBottom:12, padding:'9px 12px', background:`${C.red}10`,   borderRadius:8, lineHeight:1.5 }}>{err}</div>}
              {success && <div style={{ fontSize:12, color:C.green, marginBottom:12, padding:'9px 12px', background:`${C.green}10`, borderRadius:8, lineHeight:1.5 }}>{success}</div>}

              <button type="submit" disabled={loading} style={{
                width:'100%', padding:12, borderRadius:9, border:'none',
                cursor:loading?'not-allowed':'pointer', fontWeight:700, fontSize:14,
                background: loading ? `${C.green}80` : `linear-gradient(135deg,${C.green},#1a7a42)`,
                color:'white', boxShadow:`0 4px 14px ${C.green}30`, transition:'all 0.2s',
              }}>
                {loading ? 'Création...' : 'Créer le compte →'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}