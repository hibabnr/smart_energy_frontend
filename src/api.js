// ============================================================
// API TRANSPORT — Wattiya Frontend
// ============================================================
// Couche basse : fonctions HTTP génériques (apiGet, apiPost, etc.)
// La couche métier est dans src/services/api.js
// ============================================================

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api';
// ── STOCKAGE TOKEN ──────────────────────────────────────────
const TOKEN_KEY = 'cc_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ── FONCTION INTERNE : requête HTTP générique ───────────────
async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  
  let res, data;
  try {
    res = await fetch(`${API_URL}${path}`, opts);
  } catch (err) {
    throw new Error('Impossible de joindre le serveur (port 3000)');
  }
  
  try {
    data = await res.json();
  } catch (err) {
    throw new Error(`Réponse invalide du serveur (HTTP ${res.status})`);
  }
  
  if (!res.ok) {
    throw new Error(data.erreur || data.message || `Erreur ${res.status}`);
  }
  
  return data;
}

// ============================================================
// API GÉNÉRIQUES (utilisées par src/services/api.js)
// ============================================================
export const apiGet    = (path)       => request('GET',    path);
export const apiPost   = (path, body) => request('POST',   path, body);
export const apiPut    = (path, body) => request('PUT',    path, body);
export const apiPatch  = (path, body) => request('PATCH',  path, body);
export const apiDelete = (path)       => request('DELETE', path);

// ============================================================
// HELPERS AUTH (utilisés directement par Login.jsx / App.jsx)
// ============================================================
export async function login(email, mot_de_passe) {
  const data = await apiPost('/auth/login', { email, mot_de_passe });
  if (data.token) setToken(data.token);
  return data;
}

export async function register(payload) {
  const data = await apiPost('/auth/register', payload);
  if (data.token) setToken(data.token);
  return data;
}

export async function getMe() {
  const data = await apiGet('/profile/me');
  return data.profile || data;    
}

export function logout() {
  clearToken();
  localStorage.removeItem('cc_user');
  localStorage.removeItem('cc_admin');
}