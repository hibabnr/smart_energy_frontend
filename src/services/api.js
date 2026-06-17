import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '../api.js';


export const api = {
  // ── AUTH ────────────────────────────────────────────────────
  auth: {
    login: (email, pass) => apiPost('/auth/login', { email, mot_de_passe: pass }),
  },

  // ── ALERTS (depuis table `detection`) ───────────────────────
  alerts: {
    getAll:     ()   => apiGet('/alerts'),
    getPending: ()   => apiGet('/alerts?status=pending'),
    resolve:    (id) => apiPatch(`/alerts/${id}/resolve`, {}),
  },

  // ── BUILDINGS (pavillons) & ROOMS (chambres) ────────────────





  buildings: {
  // ── Pavillons ──────────────────────────────────────────
  getAll:  ()         => apiGet('/buildings'),
  getById: (id)       => apiGet(`/buildings/${id}`),
  create:  (data)     => apiPost('/buildings', data),
  update:  (id, data) => apiPut(`/buildings/${id}`, data),
  delete:  (id)       => apiDelete(`/buildings/${id}`),
  // ── Résidents d'une chambre ─────────────────────────
  getAvailableResidents: (roomId)              => apiGet(`/buildings/rooms/${roomId}/available-residents`),
  addResident:           (roomId, residentId)  => apiPost(`/buildings/rooms/${roomId}/residents`, { resident_id: residentId }),
  removeResident:        (roomId, residentId)  => apiDelete(`/buildings/rooms/${roomId}/residents/${residentId}`),

  
  // ── Chambres ───────────────────────────────────────────
  getRooms:         (building)        => apiGet(building 
                                            ? `/buildings/rooms?building=${building}` 
                                            : `/buildings/rooms`),
  getRoom:          (id)              => apiGet(`/buildings/rooms/${id}`),
  createRoom:       (data)            => apiPost('/buildings/rooms', data),
  updateRoom:       (id, data)        => apiPut(`/buildings/rooms/${id}`, data),
  updateRoomStatus: (id, status)      => apiPatch(`/buildings/rooms/${id}/status`, { status }),
  deleteRoom:       (id)              => apiDelete(`/buildings/rooms/${id}`),
},

  // ── CONSUMPTION ─────────────────────────────────────────────
  consumption: {
    getChart: (period) => apiGet(`/consumption/chart?period=${period}`),
    getToday: ()       => apiGet('/consumption/today'),
  },

  // ── DASHBOARD (endpoint agrégé) ─────────────────────────────
  dashboard: {
    getSummary: () => apiGet('/dashboard/summary'),
  },

  // ── USERS ───────────────────────────────────────────────────
  users: {
    getAll:  ()     => apiGet('/admin/users'),
    getById: (id)   => apiGet(`/admin/users/${id}`),
    create:  (data) => apiPost('/admin/users', data),
    update:  (id, data) => apiPut(`/admin/users/${id}`, data),
    delete:  (id)   => apiDelete(`/admin/users/${id}`),
  },

  // ── DEVICES ─────────────────────────────────────────────────
  devices: {
    getAll: ()     => apiGet('/admin/devices'),
    create: (data) => apiPost('/admin/devices', data),
    
  },

  // ── INTERVENTIONS ───────────────────────────────────────────
  interventions: {
    getAll:       ()           => apiGet('/admin/interventions'),
    getByTech:    (techId)     => apiGet(`/admin/interventions?tech=${techId}`),
    create:       (data)       => apiPost('/admin/interventions', data),
    updateStatus: (id, status) => apiPatch(`/admin/interventions/${id}`, { status }),
  },

  // ── RECOMMENDATIONS ─────────────────────────────────────────
  recommendations: {
    getByUser: (userId) => apiGet(`/admin/recommendations/user/${userId}`),
    markRead:  (id)     => apiPatch(`/admin/recommendations/${id}`, { status: 'read' }),
  },


  sonoff: {
  getAll:           ()                 => apiGet('/sonoff'),
  create:           (data)             => apiPost('/sonoff', data),
  setMaintenance:   (id, isMaintenance) => apiPatch(`/sonoff/${id}/maintenance`, { is_maintenance: isMaintenance }),
  setPower: (id, on) => apiPatch(`/sonoff/${id}/power`, { on }),
  delete:           (id)               => apiDelete(`/sonoff/${id}`),
},

reports: {
  getStats:        (period) => apiGet(`/reports/stats?period=${period}`),
  getSonoffDetail: ()       => apiGet('/reports/sonoff-detail'),   // 👈 cette ligne manquait
},

};