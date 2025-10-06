window.API_CONTRACT = {
  login: {
    method: 'POST',
    url: '/api/login',
    body: { correo: 'string', password: 'string' },
    response: { token: 'string', usuario: { nombre: 'string', rol: 'string' } }
  },

  registrarCliente: {
    method: 'POST',
    url: '/api/clientes',
    body: { correo: 'string', password: 'string', telefono: 'string' },
    response: { mensaje: 'string' }
  },

  productos: {
    list: { method: 'GET', url: '/api/productos' },
    create: {
      method: 'POST',
      url: '/api/productos',
      body: { nombre: 'string', precio: 'number', cantidad: 'number', temporada: 'string' }
    }
  },

  carrito: {
  list: { method: 'GET', url: '/api/carrito' },
  add: {
    method: 'POST',
    url: '/api/carrito',
    body: {
      productoId: 'number',
      cantidad: 'number'
    },
    response: {
      mensaje: 'Producto agregado al carrito'
    }
  }
},

  pedidos: {
    create: {
      method: 'POST',
      url: '/api/pedidos',
      body: {
        productos: [{ productoId: 'number', cantidad: 'number' }],
        metodoEnvio: 'string'
      }
    },
    getById: id => ({ method: 'GET', url: `/api/pedidos/${id}` }),
    anular: id => ({
      method: 'POST',
      url: `/api/pedidos/${id}/anular`,
      body: { motivo: 'string' }
    })
  },

  usuarios: {
    create: {
      method: 'POST',
      url: '/api/usuarios',
      body: { nombre: 'string', correo: 'string', rol: 'string', password: 'string' }
    },
    update: id => ({
      method: 'PUT',
      url: `/api/usuarios/${id}`,
      body: { nombre: 'string', correo: 'string', rol: 'string' }
    }),
    delete: id => ({ method: 'DELETE', url: `/api/usuarios/${id}` })
  },

  reportes: {
    get: periodo => ({
      method: 'GET',
      url: `/api/reportes?periodo=${encodeURIComponent(periodo)}`
    })
  }
};