// ── DESIGN TOKENS ────────────────────────────────────────────
export const C = {
  navy:    '#1F3864',
  blue:    '#2E74B5',
  teal:    '#17A2B8',
  green:   '#2ECC71',
  orange:  '#F39C12',
  red:     '#E74C3C',
  bg:      '#F8F9FA',
  card:    '#FFFFFF',
  text:    '#2C3E50',
  muted:   '#6C757D',
  border:  '#E9ECEF',
  sidebar: '#151f38',
  sidebarHover:  'rgba(255,255,255,0.07)',
  sidebarActive: 'rgba(46,116,181,0.25)',
};

// ── MOCK DATA ─────────────────────────────────────────────────
export const ALERTS = [
  { id:1, time:'08:42', room:'B3-214', building:'Bâtiment B', resident:'Karim Mansouri',  type:'Appareil illicite',    severity:'critical', status:'pending'  },
  { id:2, time:'07:15', room:'A1-108', building:'Bâtiment A', resident:'Sara Benali',     type:'Dépassement de seuil', severity:'warning',  status:'pending'  },
  { id:3, time:'06:30', room:'C2-312', building:'Bâtiment C', resident:'Yacine Ouali',    type:'Coupure détectée',     severity:'info',     status:'resolved' },
  { id:4, time:'05:55', room:'D4-105', building:'Bâtiment D', resident:'Amira Haddad',    type:'Dépassement de seuil', severity:'critical', status:'pending'  },
  { id:5, time:'04:20', room:'A2-207', building:'Bâtiment A', resident:'Riad Bouzid',     type:'Appareil illicite',    severity:'warning',  status:'pending'  },
  { id:6, time:'22:10', room:'B1-316', building:'Bâtiment B', resident:'Nadia Ferhat',    type:'Coupure détectée',     severity:'info',     status:'resolved' },
  { id:7, time:'20:05', room:'E3-201', building:'Bâtiment E', resident:'Mehdi Kaci',      type:'Dépassement de seuil', severity:'warning',  status:'archived' },
  { id:8, time:'18:30', room:'D2-118', building:'Bâtiment D', resident:'Lina Abboud',     type:'Appareil illicite',    severity:'critical', status:'resolved' },
];

export const BUILDINGS = [
  { id:'A', name:'Bâtiment A', rooms:48, active:45, consumption:124.3, status:'normal', floors:4 },
  { id:'B', name:'Bâtiment B', rooms:52, active:49, consumption:187.6, status:'alert',  floors:4 },
  { id:'C', name:'Bâtiment C', rooms:40, active:38, consumption:98.2,  status:'normal', floors:3 },
  { id:'D', name:'Bâtiment D', rooms:36, active:33, consumption:201.4, status:'alert',  floors:3 },
  { id:'E', name:'Bâtiment E', rooms:44, active:44, consumption:76.8,  status:'normal', floors:4 },
];

const NAMES = ['Karim Mansouri','Sara Benali','Yacine Ouali','Amira Haddad','Riad Bouzid','Nadia Ferhat','Mehdi Kaci','Lina Abboud','Omar Ziani','Fatima Rahmani','Ali Bensalem','Karima Touati','Hassan Ouali','Meriem Kaddour','Sofiane Belaid','Amina Hadjadj','Bilal Seghir','Samira Talbi','Mourad Benali','Nassim Boutiba'];
const CONSUMPTIONS = [3.2,1.8,1.1,4.1,2.7,0.9,2.3,3.8,1.5,1.2,2.0,0.8,4.5,1.6,1.9,2.2,3.1,1.0,2.6,1.4];
const STATUSES = ['alert','warning','normal','alert','warning','normal','normal','alert','normal','normal','normal','normal','alert','normal','normal','normal','warning','normal','normal','normal'];

export const ROOMS = Array.from({ length: 20 }, (_, i) => ({
  id: `${'ABCDE'[i % 5]}${Math.floor(i / 5) + 1}-${200 + i}`,
  resident: NAMES[i],
  consumption: CONSUMPTIONS[i],
  status: STATUSES[i],
  lastActivity: ['5 min','12 min','1h','3h','5 min','30 min','2h','15 min','8 min','1h','20 min','45 min','3 min','6h','2h','1h','10 min','4h','35 min','2h'][i],
  floor: Math.floor(i / 4) + 1,
  building: 'ABCDE'[i % 5],
}));

export const USERS = [
  { id:1,  initials:'KM', name:'Karim Mansouri',   role:'resident',   matricule:'ETU-2023-001', room:'B3-214',       date:'15 Sep 2023', status:'alert',   consumption:3.2 },
  { id:2,  initials:'SB', name:'Sara Benali',       role:'resident',   matricule:'ETU-2022-047', room:'A1-108',       date:'01 Oct 2022', status:'warning', consumption:1.8 },
  { id:3,  initials:'YO', name:'Yacine Ouali',      role:'resident',   matricule:'ETU-2024-012', room:'C2-312',       date:'20 Sep 2024', status:'normal',  consumption:1.1 },
  { id:4,  initials:'AH', name:'Amira Haddad',      role:'resident',   matricule:'ETU-2023-089', room:'D4-105',       date:'18 Sep 2023', status:'alert',   consumption:4.1 },
  { id:5,  initials:'RB', name:'Riad Bouzid',       role:'resident',   matricule:'ETU-2024-034', room:'A2-207',       date:'22 Sep 2024', status:'warning', consumption:2.7 },
  { id:6,  initials:'NF', name:'Nadia Ferhat',      role:'resident',   matricule:'ETU-2022-156', room:'B1-316',       date:'05 Oct 2022', status:'normal',  consumption:0.9 },
  { id:7,  initials:'MK', name:'Mehdi Kaci',        role:'resident',   matricule:'ETU-2024-078', room:'E3-201',       date:'25 Sep 2024', status:'warning', consumption:2.3 },
  { id:8,  initials:'MZ', name:'Mohamed Zerrouk',   role:'technician', matricule:'TEC-2021-003', room:'Secteur A-B',  date:'01 Mar 2021', status:'normal',  consumption:0   },
  { id:9,  initials:'FR', name:'Fatima Rahmani',    role:'technician', matricule:'TEC-2022-001', room:'Secteur C-D-E',date:'15 Jan 2022', status:'normal',  consumption:0   },
  { id:10, initials:'DR', name:'Dr. Ahmed Rezgui',  role:'admin',      matricule:'DIR-2021-001', room:'—',            date:'01 Sep 2021', status:'normal',  consumption:0   },
];

export const SONOFF = Array.from({ length: 12 }, (_, i) => ({
  id: `SNFF-${String(i + 1).padStart(3, '0')}`,
  room: `${'ABCDE'[i % 5]}${Math.floor(i / 5) + 1}-${200 + i * 2}`,
  ip: `192.168.1.${10 + i}`,
  firmware: i < 9 ? '3.6.0' : '3.5.8',
  lastPing: i < 10 ? 'Il y a 2 min' : 'Il y a 3h',
  status: i === 10 ? 'offline' : i === 11 ? 'maintenance' : 'online',
  uptime: `${10 + i}j ${i * 2}h`,
  rssi: -(40 + i * 3),
}));

// ── CHART DATA ────────────────────────────────────────────────
export const CHART_DATA = {
  '24h': { data: [42,38,35,30,28,32,45,67,82,91,88,85,79,83,87,90,84,78,72,68,65,60,55,48], labels: ['0h','3h','6h','9h','12h','15h','18h','21h','24h'] },
  '7j':  { data: [480,520,495,610,580,540,688], labels: ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'] },
  '30j': { data: [580,600,490,520,560,540,610,590,570,530,550,580,600,620,590,570,545,510,530,560,580,600,615,590,570,550,530,520,510,495], labels: ['1','5','10','15','20','25','30'] },
};
