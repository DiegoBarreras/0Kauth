const BASE_URL = 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Error desconocido');
  }

  return data;
}

export const api = {
  registro: (email, password) =>
    request('/auth/registro', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getCuentas: () => request('/cuentas'),

  agregarCuenta: (cuenta) =>
    request('/cuentas', {
      method: 'POST',
      body: JSON.stringify(cuenta),
    }),

  eliminarCuenta: (id) =>
    request(`/cuentas/${id}`, {
      method: 'DELETE',
    }),
};