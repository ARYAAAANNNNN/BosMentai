const BASE_URL = import.meta.env.VITE_API_URL || '';

const apiFetch = async (url, options = {}) => {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
};

export const menuAPI = {
  getAll:     ()           => apiFetch('/api/menus'),
  getForUser: (category)   => apiFetch(`/api/menus/user${category ? `?category=${category}` : ''}`),
  getById:    (id)         => apiFetch(`/api/menus/${id}`),
  create:     (formData)   => fetch(`${BASE_URL}/api/menus`, { method: 'POST', body: formData }).then(r => r.json()),
  update:     (id, fd)     => fetch(`${BASE_URL}/api/menus/${id}`, { method: 'PUT', body: fd }).then(r => r.json()),
  delete:     (id)         => apiFetch(`/api/menus/${id}`, { method: 'DELETE' }),
  updateStok: (id, body)   => apiFetch(`/api/menus/${id}/stok`, { method: 'PATCH', body: JSON.stringify(body) }),
};

export const orderAPI = {
  getAll:       (q = {})     => apiFetch(`/api/orders?${new URLSearchParams(q)}`),
  getKitchen:   ()           => apiFetch('/api/orders/kitchen'),
  getById:      (id)         => apiFetch(`/api/orders/${id}`),
  create:       (data)       => apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, status) => apiFetch(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete:       (id)         => apiFetch(`/api/orders/${id}`, { method: 'DELETE' }),
};

export const statsAPI = {
  get:             () => apiFetch('/api/stats'),
  getSalesChart:   () => apiFetch('/api/stats/sales-chart'),
  getVisitorChart: () => apiFetch('/api/stats/visitor-chart'),
  getRecentOrders: () => apiFetch('/api/stats/recent-orders'),
};