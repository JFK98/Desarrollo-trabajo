//Definición del contrato de la API
const API_BASE_URL = 'http://localhost:3000/api';

const API_CONTRACT = {
  auth: {
    login: {
      method: 'POST',
      url: `${API_BASE_URL}/auth/login`
    },
    registro: {
      method: 'POST',
      url: `${API_BASE_URL}/auth/registro`
    },
    logout: {
      method: 'POST',
      url: `${API_BASE_URL}/auth/logout`
    }
  },

  usuarios: {
    crear: {
      method: 'POST',
      url: `${API_BASE_URL}/usuarios`
    },
    listar: {
      method: 'GET',
      url: `${API_BASE_URL}/usuarios`
    },
    eliminar: (id) => ({
      method: 'DELETE',
      url: `${API_BASE_URL}/usuarios/${id}`
    }),
    actualizar: (id) => ({
      method: 'PUT',
      url: `${API_BASE_URL}/usuarios/${id}`
    })
  },

  productos: {
    listar: {
      method: 'GET',
      url: `${API_BASE_URL}/productos`
    },
    obtener: (id) => ({
      method: 'GET',
      url: `${API_BASE_URL}/productos/${id}`
    }),
    crear: {
      method: 'POST',
      url: `${API_BASE_URL}/productos`
    },
    actualizar: (id) => ({
      method: 'PUT',
      url: `${API_BASE_URL}/productos/${id}`
    }),
    eliminar: (id) => ({
      method: 'DELETE',
      url: `${API_BASE_URL}/productos/${id}`
    })
  },

  carrito: {
    obtener: {
      method: 'GET',
      url: `${API_BASE_URL}/carrito`
    },
    agregar: {
      method: 'POST',
      url: `${API_BASE_URL}/carrito/agregar`
    },
    actualizar: {
      method: 'PUT',
      url: `${API_BASE_URL}/carrito/actualizar`
    },
    eliminar: {
      method: 'DELETE',
      url: `${API_BASE_URL}/carrito/eliminar`
    }
  },

  pedidos: {
    listar: {
      method: 'GET',
      url: `${API_BASE_URL}/pedidos`
    },
    crear: {
      method: 'POST',
      url: `${API_BASE_URL}/pedidos`
    },
    obtener: (id) => ({
      method: 'GET',
      url: `${API_BASE_URL}/pedidos/${id}`
    }),
    anular: (id) => ({
      method: 'POST',
      url: `${API_BASE_URL}/pedidos/${id}/anular`
    })
  },

  reportes: {
    ventas: {
      method: 'GET',
      url: `${API_BASE_URL}/reportes/ventas`
    },
    inventario: {
      method: 'GET',
      url: `${API_BASE_URL}/reportes/inventario`
    }
  }
};

window.API_CONTRACT = API_CONTRACT;