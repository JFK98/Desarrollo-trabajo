//Manejo de peticiones a la API
const apiFetch = async (entry, { body, params } = {}) => {
  try {
    const token = localStorage.getItem('token');
    const config = typeof entry === 'function' ? entry(params) : entry;

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(config.url, {
      method: config.method,
      headers,
      ...(body && { body: JSON.stringify(body) })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en la petición');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return null;

  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

window.apiFetch = apiFetch;