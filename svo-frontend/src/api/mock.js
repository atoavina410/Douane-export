// src/api/mock.js
// simple in-memory mock to test dashboard UI
export const SAMPLE_VALUES = Array.from({ length: 36 }).map((_, i) => ({
  id_valeur: i + 1,
  codesh: `0101${String(i).padStart(2, '0')}`,
  description_valeur: `Article exemple ${i + 1}`,
  origine_produit: i % 2 === 0 ? 'Madagascar' : 'Chine',
  quantite: (i + 1) * 10,
  devise_utilisee: i % 3 === 0 ? 'USD' : 'EUR',
  status: i % 5 === 0 ? 'EN_ATTENTE' : 'VALIDEE',
  date_saisie: new Date(Date.now() - i * 86400000).toISOString().slice(0,10)
}));

export function fetchDashboardStats() {
  const total = SAMPLE_VALUES.length;
  const en_attente = SAMPLE_VALUES.filter(v => v.status === 'EN_ATTENTE').length;
  const validees = SAMPLE_VALUES.filter(v => v.status === 'VALIDEE').length;
  return Promise.resolve({ total, en_attente, validees });
}

export function fetchRecentValues(page = 1, pageSize = 8) {
  const start = (page - 1) * pageSize;
  const data = SAMPLE_VALUES.slice(start, start + pageSize);
  return Promise.resolve({ data, total: SAMPLE_VALUES.length });
}

