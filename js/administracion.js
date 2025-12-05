document.addEventListener('DOMContentLoaded', async () => {
  const rol = localStorage.getItem('rol');
  if (!rol || !['admin', 'encargado', 'dueño'].includes(rol)) {
    alert('Acceso no autorizado');
    window.location.href = 'login.html';
    return;
  }

  initializeEvents();
  await loadInitialData();
});

function initializeEvents() {
  document.querySelectorAll('#sidebarMenu .nav-link').forEach(link => link.addEventListener('click', handleMenuChange));

  const btnCerrar = document.getElementById('btnCerrarSesion');
  if (btnCerrar) btnCerrar.addEventListener('click', handleLogout);

  const btnConsultar = document.getElementById('btnConsultar');
  if (btnConsultar) btnConsultar.addEventListener('click', () => {
    const tipo = document.querySelector("#formReporte select")?.value || 'diario';
    generarReporte(tipo);
  });

  setupPedidosEvents();

  const crearUsuarioForm = document.getElementById('crearUsuarioForm');
  if (crearUsuarioForm) crearUsuarioForm.addEventListener('submit', handleCreateUser);

  const crearProductoForm = document.getElementById('crearProductoForm');
  if (crearProductoForm) crearProductoForm.addEventListener('submit', handleCreateProduct);
}


async function apiGet(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, { credentials: 'same-origin' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.msg || `${res.status} ${res.statusText}`);
  }
  return res.json();
}
async function apiPost(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'same-origin'
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.msg || `${res.status} ${res.statusText}`);
  return json;
}
async function apiPut(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'same-origin'
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.msg || `${res.status} ${res.statusText}`);
  return json;
}
async function apiDelete(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, { method: 'DELETE', credentials: 'same-origin' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.msg || `${res.status} ${res.statusText}`);
  return json;
}

//DASHBOARD 
   
async function loadInitialData() {
  const defaultSection = document.querySelector('#sidebarMenu .nav-link.active')?.dataset.section || 'dashboard';
  document.querySelectorAll('.section-content').forEach(sec => sec.classList.add('d-none'));
  document.getElementById(defaultSection)?.classList.remove('d-none');

  if (defaultSection === 'dashboard') await loadDashboardData();
  if (defaultSection === 'usuarios') await loadUsers();
  if (defaultSection === 'productos') await loadProducts();
  if (defaultSection === 'pedidos') await loadPedidos();
}

async function loadDashboardData() {
  try {
    const ventasResp = await apiGet('/reportes/ventas');
    const inventarioResp = await apiGet('/reportes/inventario');

    const totalVentas = ventasResp.total ?? ventasResp.ventasTotales ?? 0;
    const totalPedidos = ventasResp.pedidos ?? ventasResp.cantidadPedidos ?? 0;
    const stockBajo = inventarioResp.stockBajo ?? inventarioResp.inventario?.stockBajo ?? 0;

    const elTotalVentas = document.getElementById('totalVentas');
    const elTotalPedidos = document.getElementById('totalPedidos');
    const elStockBajo = document.getElementById('stockBajo');

    if (elTotalVentas) elTotalVentas.textContent = `$${Number(totalVentas).toLocaleString()}`;
    if (elTotalPedidos) elTotalPedidos.textContent = Number(totalPedidos).toLocaleString();
    if (elStockBajo) elStockBajo.textContent = Number(stockBajo).toLocaleString();
  } catch (err) {
    console.error('loadDashboardData error', err);
    showErrorMessage('No se pudo cargar el dashboard: ' + err.message);
  }
}

//USUARIOS
  
async function loadUsers() {
  try {
    const res = await apiGet('/usuarios');
    const usuarios = res.usuarios || res || [];
    const tbody = document.querySelector('#usuariosTable tbody');
    if (!tbody) return;
    tbody.innerHTML = usuarios.map(u => `
      <tr>
        <td>${escapeHtml(u.nombre)}</td>
        <td>${escapeHtml(u.correo)}</td>
        <td>${escapeHtml(u.rol)}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="abrirModalEditar('${u._id}', '${escapeJs(u.nombre)}', '${escapeJs(u.correo)}', '${escapeJs(u.rol)}', '${escapeJs(u.telefono || '')}')">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarUsuario('${u._id}')">Eliminar</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('loadUsers error', err);
    showErrorMessage('Error al cargar usuarios: ' + err.message);
  }
}

async function eliminarUsuario(usuarioId) {
  if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
  try {
    await apiDelete(`/usuarios/${usuarioId}`);
    showSuccessMessage('Usuario eliminado correctamente');
    await loadUsers();
  } catch (err) {
    console.error('eliminarUsuario error', err);
    showErrorMessage('Error al eliminar usuario: ' + err.message);
  }
}

function abrirModalEditar(id, nombre, correo, rol, telefono) {
  const modalEl = document.getElementById('modalEditarUsuario');
  if (!modalEl) {
    showErrorMessage('Modal de editar no encontrado');
    return;
  }

  document.getElementById('usuarioIdEditar').value = id;
  document.getElementById('nombreEditar').value = nombre;
  document.getElementById('correoEditar').value = correo;
  document.getElementById('rolEditar').value = rol;
  document.getElementById('telefonoEditar').value = telefono;

  const form = document.getElementById('formEditarUsuario');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      try {
        await apiPut(`/usuarios/${id}`, {
          nombre: document.getElementById('nombreEditar').value,
          correo: document.getElementById('correoEditar').value,
          rol: document.getElementById('rolEditar').value,
          telefono: document.getElementById('telefonoEditar').value
        });
        showSuccessMessage('Usuario actualizado correctamente');
        bootstrap.Modal.getInstance(modalEl)?.hide();
        await loadUsers();
      } catch (err) {
        console.error('formEditarUsuario error', err);
        showErrorMessage('Error al actualizar usuario: ' + err.message);
      }
    };
  }

  new bootstrap.Modal(modalEl).show();
}

//PRODUCTOS

async function loadProducts() {
  try {
    const res = await apiGet('/productos');
    const productos = res.productos || res || [];
    const tbody = document.querySelector('#productosTable tbody');
    if (!tbody) return;
    tbody.innerHTML = productos.map(p => `
      <tr>
        <td>${escapeHtml(p.nombre)}</td>
        <td>$${Number(p.precio || 0).toLocaleString()}</td>
        <td>${(p.stock == null) ? '-' : Number(p.stock).toLocaleString()}</td>
        <td>${escapeHtml(p.temporada || '-')}</td>
        <td><button class="btn btn-danger btn-sm" onclick="eliminarProducto('${p._id}')">Eliminar</button></td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('loadProducts error', err);
    showErrorMessage('Error al cargar productos: ' + err.message);
  }
}

async function eliminarProducto(productoId) {
  if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
  try {
    await apiDelete(`/productos/${productoId}`);
    showSuccessMessage('Producto eliminado correctamente');
    await loadProducts();
  } catch (err) {
    console.error('eliminarProducto error', err);
    showErrorMessage('Error al eliminar producto: ' + err.message);
  }
}

//PEDIDOS
   
async function loadPedidos() {
  try {
    const res = await apiGet('/pedidos');
    const pedidos = res.pedidos || res || [];
    const tbody = document.querySelector('#pedidosTable tbody');
    const theadRow = document.querySelector('#pedidosTable thead tr');
    if (!tbody || !theadRow) return;

    theadRow.innerHTML = `
      <th>ID Pedido</th>
      <th>Cliente</th>
      <th>Fecha</th>
      <th>Total</th>
      <th>Estado</th>
      <th>Acciones</th>
    `;

    tbody.innerHTML = pedidos.map(p => {
      const fecha = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-';
      const total = Number(p.total || 0);
      const estado = p.estado || 'pendiente';
      let badgeClass = 'bg-secondary';
      if (estado === 'confirmado') badgeClass = 'bg-info';
      if (estado === 'preparacion') badgeClass = 'bg-warning';
      if (estado === 'entregado') badgeClass = 'bg-success';
      if (estado === 'anulado') badgeClass = 'bg-danger';

      const clienteTexto = p.usuarioId && typeof p.usuarioId === 'object'
        ? (p.usuarioId.nombre || p.usuarioId.correo || '-')
        : (p.usuarioId || '-');

      return `
        <tr>
          <td><strong>${p._id}</strong></td>
          <td>${escapeHtml(clienteTexto)}</td>
          <td>${fecha}</td>
          <td>$${total.toLocaleString()}</td>
          <td><span class="badge ${badgeClass}">${escapeHtml(capitalize(estado))}</span></td>
          <td>
            <div class="btn-group btn-group-sm" role="group">
              <button class="btn btn-info btn-sm" onclick="verDetallesPedido('${p._id}')"><i class="bi bi-eye"></i> Ver</button>
              <button class="btn btn-warning btn-sm" onclick="editarPedido('${p._id}')"><i class="bi bi-pencil"></i> Editar</button>
              <button class="btn btn-secondary btn-sm" onclick="imprimirBoleta('${p._id}')"><i class="bi bi-printer"></i> Imprimir</button>
              <button class="btn btn-danger btn-sm" onclick="anularPedido('${p._id}')"><i class="bi bi-x-circle"></i> Anular</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('loadPedidos error', err);
    showErrorMessage('Error al cargar pedidos: ' + err.message);
  }
}

async function verDetallesPedido(pedidoId) {
  try {
    const res = await apiGet(`/pedidos/detalle/${pedidoId}`);
    const pedido = res.pedido;
    if (!pedido) throw new Error('Pedido no encontrado');

    const usuario = await resolveUsuario(pedido.usuarioId);

    const verId = document.getElementById('verPedidoId');
    const verEstado = document.getElementById('verEstadoPedido');
    const verEntrega = document.getElementById('verEntregaTipo');
    const verShipping = document.getElementById('verShippingCost');
    const verDireccion = document.getElementById('verDireccionPedido');
    const verItems = document.getElementById('verPedidoItems');
    const verTotal = document.getElementById('verTotalPedido');

    if (verId) verId.value = pedido._id;
    if (verEstado) verEstado.value = capitalize(pedido.estado || 'pendiente');
    if (verEntrega) verEntrega.value = pedido.entregaTipo === 'domicilio' ? 'Envío a domicilio' : 'Retiro / Entrega presencial';
    if (verShipping) verShipping.textContent = Number(pedido.shippingCost || 0).toLocaleString();
    if (verDireccion) verDireccion.value = pedido.direccion || 'No especificada';
    if (verTotal) verTotal.textContent = Number(pedido.total || 0).toLocaleString();

    if (verItems) {
      verItems.innerHTML = (pedido.items || []).map(i => {
        const nombre = escapeHtml(i.nombre || (i.productoId?.nombre || 'Producto'));
        const cantidad = Number(i.cantidad || 0);
        const precio = Number(i.precio || 0);
        const subtotal = precio * cantidad;
        return `
          <div class="alert alert-light mb-2 d-flex justify-content-between align-items-center">
            <div>
              <strong>${nombre}</strong><div class="text-muted small">${usuario.nombre ? 'Cliente: ' + escapeHtml(usuario.nombre) : ''}</div>
            </div>
            <div class="text-end">
              <div>Cant: ${cantidad}</div>
              <div><strong>$${subtotal.toLocaleString()}</strong></div>
            </div>
          </div>
        `;
      }).join('') || '<p class="text-muted">Sin items</p>';
    }

    const modalEl = document.getElementById('modalVerPedido');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  } catch (err) {
    console.error('verDetallesPedido error', err);
    showErrorMessage('Error al obtener detalle del pedido: ' + err.message);
  }
}

async function editarPedido(pedidoId) {
  try {
    const res = await apiGet(`/pedidos/detalle/${pedidoId}`);
    const pedido = res.pedido;
    if (!pedido) throw new Error('Pedido no encontrado');

    const usuario = await resolveUsuario(pedido.usuarioId);

    const pedidoIdInput = document.getElementById('pedidoId');
    const estadoSelect = document.getElementById('estadoPedido');
    const direccionInput = document.getElementById('direccionPedido');
    const totalSpan = document.getElementById('totalPedidoModal');
    const entregaSelect = document.getElementById('entregaTipoPedido');
    const shippingSpan = document.getElementById('shippingCostModal');
    const pedidoItems = document.getElementById('pedidoItems');

    if (pedidoIdInput) pedidoIdInput.value = pedido._id;
    if (estadoSelect) estadoSelect.value = pedido.estado || 'pendiente';
    if (direccionInput) direccionInput.value = pedido.direccion || '';
    if (totalSpan) totalSpan.textContent = Number(pedido.total || 0).toLocaleString();
    if (entregaSelect) entregaSelect.value = pedido.entregaTipo || 'presencial';
    if (shippingSpan) shippingSpan.textContent = Number(pedido.shippingCost || 0).toLocaleString();

    let clienteInfoEl = document.getElementById('pedidoClienteInfo');
    if (!clienteInfoEl) {
      const modalEl = document.getElementById('modalActualizarPedido');
      if (modalEl) {
        const form = modalEl.querySelector('.modal-body form');
        if (form) {
          const wrapper = document.createElement('div');
          wrapper.className = 'row mb-3';
          wrapper.innerHTML = `<div class="col-12"><label class="form-label fw-bold">Cliente</label><input type="text" id="pedidoClienteInfo" class="form-control" readonly></div>`;
          form.insertBefore(wrapper, form.firstChild.nextSibling);
        }
      }
      clienteInfoEl = document.getElementById('pedidoClienteInfo');
    }
    if (clienteInfoEl) clienteInfoEl.value = `${usuario.nombre || 'N/A'} ${usuario.correo ? '(' + usuario.correo + ')' : ''}`;

    if (pedidoItems) {
      pedidoItems.innerHTML = (pedido.items || []).map(i => `
        <div class="alert alert-light mb-2">
          <strong>${escapeHtml(i.nombre || (i.productoId?.nombre || ''))}</strong> x ${Number(i.cantidad || 0)} = $${(Number(i.precio || 0) * Number(i.cantidad || 0)).toLocaleString()}
        </div>
      `).join('') || '<p class="text-muted">Sin items</p>';
    }

    const form = document.getElementById('formActualizarPedido');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        try {
          const update = {
            estado: document.getElementById('estadoPedido').value,
            direccion: document.getElementById('direccionPedido').value
          };
          await apiPut(`/pedidos/${pedidoId}`, update);
          showSuccessMessage('Pedido actualizado correctamente');
          bootstrap.Modal.getInstance(document.getElementById('modalActualizarPedido'))?.hide();
          await loadPedidos();
        } catch (err) {
          console.error('editarPedido submit error', err);
          showErrorMessage('Error al actualizar pedido: ' + err.message);
        }
      };
    }

    const modalEl = document.getElementById('modalActualizarPedido');
    if (modalEl) new bootstrap.Modal(modalEl).show();
  } catch (err) {
    console.error('editarPedido error', err);
    showErrorMessage('Error al obtener pedido para editar: ' + err.message);
  }
}

async function anularPedido(pedidoId) {
  if (!confirm('¿Estás seguro de que deseas anular este pedido?')) return;
  const motivo = prompt('Ingresa el motivo de anulación:');
  if (motivo === null) return;
  try {
    await apiPut(`/pedidos/${pedidoId}/anular`, { motivo });
    showSuccessMessage('Pedido anulado correctamente');
    await loadPedidos();
  } catch (err) {
    console.error('anularPedido error', err);
    showErrorMessage('Error al anular pedido: ' + err.message);
  }
}

//Imprimir boleta
 
async function imprimirBoleta(pedidoId) {
  try {
    const res = await apiGet(`/pedidos/detalle/${pedidoId}`);
    const pedido = res.pedido;
    if (!pedido) throw new Error('Pedido no encontrado');

    const usuario = (pedido.usuarioId && typeof pedido.usuarioId === 'object') ? pedido.usuarioId : await resolveUsuario(pedido.usuarioId);

    const itemsRows = (pedido.items || []).map(it => {
      const nombre = escapeHtml(it.nombre || (it.productoId?.nombre || ''));
      const cant = Number(it.cantidad || 0);
      const precio = Number(it.precio || 0);
      const subtotal = precio * cant;
      return `<tr>
                <td style="padding:6px;border:1px solid #ddd">${nombre}</td>
                <td style="padding:6px;border:1px solid #ddd;text-align:center">${cant}</td>
                <td style="padding:6px;border:1px solid #ddd;text-align:right">$${precio.toLocaleString()}</td>
                <td style="padding:6px;border:1px solid #ddd;text-align:right">$${subtotal.toLocaleString()}</td>
              </tr>`;
    }).join('');

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:800px;margin:0 auto;padding:20px">
        <h2>Boleta / Pedido: ${escapeHtml(pedido._id)}</h2>
        <p><strong>Cliente:</strong> ${escapeHtml(usuario.nombre || 'N/A')} ${usuario.correo ? '(' + escapeHtml(usuario.correo) + ')' : ''}</p>
        <p><strong>Fecha:</strong> ${pedido.createdAt ? new Date(pedido.createdAt).toLocaleString() : '-'}</p>
        <p><strong>Estado:</strong> ${escapeHtml(capitalize(pedido.estado || 'pendiente'))}</p>
        <hr>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="text-align:left;padding:8px;border:1px solid #ddd">Producto</th>
              <th style="text-align:center;padding:8px;border:1px solid #ddd">Cant.</th>
              <th style="text-align:right;padding:8px;border:1px solid #ddd">Precio</th>
              <th style="text-align:right;padding:8px;border:1px solid #ddd">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows || '<tr><td colspan="4" style="text-align:center;padding:12px;border:1px solid #ddd">Sin items</td></tr>'}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align:right;padding:8px;border-top:2px solid #ddd"><strong>Envío</strong></td>
              <td style="text-align:right;padding:8px;border-top:2px solid #ddd">$${Number(pedido.shippingCost || 0).toLocaleString()}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align:right;padding:8px"><strong>Total</strong></td>
              <td style="text-align:right;padding:8px"><strong>$${Number(pedido.total || 0).toLocaleString()}</strong></td>
            </tr>
          </tfoot>
        </table>
        <hr>
        <p><strong>Dirección:</strong> ${escapeHtml(pedido.direccion || 'No especificada')}</p>
      </div>
    `;

    const w = window.open('', '_blank');
    if (!w) throw new Error('Ventana bloqueada por el navegador');

    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Boleta ${escapeHtml(pedido._id)}</title>
      <style>body{font-family:Arial,Helvetica,sans-serif;color:#222}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px}</style>
      </head><body>${html}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 500);

  } catch (err) {
    console.error('imprimirBoleta error', err);
    showErrorMessage('Error al imprimir boleta: ' + err.message);
  }
}

// Solicitudes anulación y boton volver a pedidos normales

function setupPedidosEvents() {
  const btnAnulacion = document.getElementById('btnAnulacion');
  const btnVolver = document.getElementById('btnVolverPedidos');

  if (btnAnulacion) {
    btnAnulacion.addEventListener('click', async () => {
      try {
        const res = await apiGet('/pedidos/solicitudes/anulacion');
        const pedidos = res.pedidos || [];
        const tbody = document.querySelector('#pedidosTable tbody');
        const theadRow = document.querySelector('#pedidosTable thead tr');
        if (!tbody || !theadRow) return;

        theadRow.innerHTML = `
          <th>ID Pedido</th>
          <th>Cliente</th>
          <th>Fecha</th>
          <th>Total</th>
          <th>Estado</th>
          <th>Motivo de Anulación</th>
        `;
        tbody.innerHTML = pedidos.map(p => `
          <tr>
            <td><strong>${p._id}</strong></td>
            <td>${escapeHtml(p.usuarioId?.nombre || p.usuarioId?.correo || '-')}</td>
            <td>${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}</td>
            <td>$${Number(p.total || 0).toLocaleString()}</td>
            <td><span class="badge bg-danger">${escapeHtml(capitalize(p.estado || 'anulado'))}</span></td>
            <td>${escapeHtml(p.motivoAnulacion || '-')}</td>
          </tr>
        `).join('');
        btnVolver?.classList.remove('d-none');
      } catch (err) {
        console.error('setupPedidosEvents - anulacion error', err);
        showErrorMessage('Error al cargar solicitudes de anulación: ' + err.message);
      }
    });
  }

  if (btnVolver) {
    btnVolver.addEventListener('click', async () => {
      await loadPedidos();
      btnVolver.classList.add('d-none');
    });
  }
}

async function handleCreateUser(e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  try {
    await apiPost('/usuarios', {
      nombre: fd.get('nombre'),
      correo: fd.get('correo'),
      rol: fd.get('rol'),
      password: fd.get('password'),
      telefono: fd.get('telefono')
    });
    showSuccessMessage('Usuario creado');
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalCrear'));
    if (modal) modal.hide();
    await loadUsers();
  } catch (err) {
    console.error('handleCreateUser error', err);
    showErrorMessage('Error al crear usuario: ' + err.message);
  }
}
async function handleCreateProduct(e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  try {
    await apiPost('/productos', {
      nombre: fd.get('nombre'),
      precio: fd.get('precio'),
      stock: fd.get('stock'),
      temporada: fd.get('temporada'),
      imagen: fd.get('imagen')
    });
    showSuccessMessage('Producto creado');
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalCrearProducto'));
    if (modal) modal.hide();
    await loadProducts();
  } catch (err) {
    console.error('handleCreateProduct error', err);
    showErrorMessage('Error al crear producto: ' + err.message);
  }
}

async function generarReporte(tipo = 'diario') {
  try {
<<<<<<< HEAD
    const res = await apiGet(`/reportes?tipo=${encodeURIComponent(tipo)}`);
    const cont = document.getElementById('reporteResultado');
    if (!cont) return;
    const reporte = res.reporte || [];
    
    // Generar tabla HTML del reporte
    const tableHtml = `
      <div class="table-responsive">
        <table class="table table-striped table-sm">
          <thead class="table-light">
            <tr>
              <th>Período</th>
              <th>Ventas</th>
              <th>Cantidad Pedidos</th>
              <th>Promedio por Pedido</th>
            </tr>
          </thead>
          <tbody>
            ${reporte.map(r => `
              <tr>
                <td><strong>${r._id}</strong></td>
                <td>$${Number(r.ventas || 0).toLocaleString()}</td>
                <td>${Number(r.pedidos || 0).toLocaleString()}</td>
                <td>$${Number(r.promedio || 0).toLocaleString('es-CL', { maximumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <button class="btn btn-primary mt-3" onclick="exportarReportePDF('${tipo}')"><i class="bi bi-file-earmark-pdf"></i> Descargar PDF</button>
    `;
    
    cont.innerHTML = tableHtml;
    cont.classList.remove('d-none');
=======
    const data = await apiFetch(API_CONTRACT.productos.listar);
    console.log("Productos recibidos:", data); 

    const productos = data.productos || [];
    const tbody = document.querySelector("#productosTable tbody");

    tbody.innerHTML = productos.map(p => `
      <tr>
        <td>${p.nombre}</td>
        <td>$${p.precio}</td>
        <td>${p.stock ?? '-'}</td>
        <td>${p.categoria ?? '-'}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="eliminarProducto('${p._id}')">Eliminar</button>
        </td>
      </tr>
    `).join("");
>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca
  } catch (err) {
    console.error('generarReporte error', err);
    showErrorMessage('Error al generar reporte: ' + err.message);
  }
}

async function exportarReportePDF(tipo = 'diario') {
  try {
<<<<<<< HEAD
    const { jsPDF } = window.jspdf;
    if (!jsPDF) return showErrorMessage('jsPDF no cargado');
=======
    const data = await apiFetch(API_CONTRACT.pedidos.listar);
    console.log("Pedidos recibidos:", data); 
>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca

    const res = await apiGet(`/reportes?tipo=${encodeURIComponent(tipo)}`);
    const reporte = res.reporte || [];

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Reporte de Ventas', 14, 20);
    doc.setFontSize(10);
    doc.text(`Tipo: ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`, 14, 30);
    doc.text(`Fecha generada: ${new Date().toLocaleString()}`, 14, 40);

    const tableData = reporte.map(r => [
      r._id,
      `$${Number(r.ventas || 0).toLocaleString()}`,
      Number(r.pedidos || 0).toLocaleString(),
      `$${Number(r.promedio || 0).toLocaleString('es-CL', { maximumFractionDigits: 2 })}`
    ]);

    doc.autoTable({
      head: [['Período', 'Ventas', 'Pedidos', 'Promedio']],
      body: tableData,
      startY: 50,
      margin: 14
    });

    doc.save(`reporte-ventas-${tipo}-${new Date().getTime()}.pdf`);
    showSuccessMessage('PDF descargado correctamente');
  } catch (err) {
    console.error('exportarReportePDF error', err);
    showErrorMessage('Error al exportar PDF: ' + err.message);
  }
}

//utilidades

async function resolveUsuario(usuarioField) {
  try {
    if (!usuarioField) return { nombre: 'N/A', correo: '' };
    if (typeof usuarioField === 'object' && (usuarioField.nombre || usuarioField.correo)) return usuarioField;
    const id = String(usuarioField || '').trim();
    if (!id) return { nombre: 'N/A', correo: '' };
    const res = await apiGet(`/usuarios/${id}`);
    return res.usuario || res || { nombre: 'N/A', correo: '' };
  } catch (err) {
    console.error('resolveUsuario error', err);
    return { nombre: 'N/A', correo: '' };
  }
}

function handleMenuChange(e) {
  e.preventDefault();
  const section = e.currentTarget.dataset.section;
  if (!section) return;
  document.querySelectorAll('.section-content').forEach(sec => sec.classList.add('d-none'));
  document.getElementById(section)?.classList.remove('d-none');
  if (section === 'usuarios') loadUsers();
  if (section === 'productos') loadProducts();
  if (section === 'pedidos') loadPedidos();
  if (section === 'dashboard') loadDashboardData();
}

async function handleLogout() {
  try { await apiPost('/auth/logout', {}); } catch (_) {}
  localStorage.clear();
  window.location.href = 'inicio.html';
}

function showSuccessMessage(msg) { alert(msg); }
function showErrorMessage(msg) { alert(msg); }
function capitalize(s) { return String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1); }
function escapeHtml(str = '') {
  return String(str).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
function escapeJs(str = '') {
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
}
<<<<<<< HEAD
=======

function updateDashboardUI(ventas, inventario) {
  // Actualizar estadísticas
  document.getElementById('totalVentas').textContent = `$${ventas.total.toLocaleString()}`;
  document.getElementById('totalPedidos').textContent = ventas.pedidos;
  document.getElementById('stockBajo').textContent = inventario.stockBajo;
}

function displayReport(data, container) {
  container.innerHTML = `
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Reporte de Ventas</h5>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Periodo</th>
                <th>Ventas</th>
                <th>Pedidos</th>
                <th>Promedio</th>
              </tr>
            </thead>
            <tbody>
              ${data.periodos.map(p => `
                <tr>
                  <td>${p.fecha}</td>
                  <td>$${p.ventas.toLocaleString()}</td>
                  <td>${p.pedidos}</td>
                  <td>$${p.promedio.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}


//Cargar lista de usuarios en la tabla
async function loadUsers() {
  try {
    const data = await apiFetch(API_CONTRACT.usuarios.listar); // GET /api/usuarios
    const usuarios = data.usuarios || data; // depende de cómo responda tu backend

    const tbody = document.querySelector("#usuariosTable tbody");
    tbody.innerHTML = usuarios.map(u => `
      <tr>
        <td>${u.nombre}</td>
        <td>${u.correo}</td>
        <td>${u.rol}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="eliminarUsuario('${u._id}')">
            Eliminar
          </button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    showErrorMessage("Error al cargar usuarios: " + err.message);
  }
}

//Eliminar usuario
async function eliminarUsuario(id) {
  if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

  try {
    await apiFetch(API_CONTRACT.usuarios.eliminar(id));
    showSuccessMessage("Usuario eliminado");
    await loadUsers(); // recargar tabla
  } catch (err) {
    showErrorMessage("Error al eliminar usuario: " + err.message);
  }
}


async function generarReporte(tipo) {
  try {
    const data = await apiFetch({ 
      method: 'GET', 
      url: `${API_BASE_URL}/reportes?tipo=${tipo}` 
    });

    const reporte = data.reporte || [];
    const contenedor = document.getElementById("reporteResultado");

    contenedor.innerHTML = `
      <h3>Reporte de Ventas</h3>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Periodo</th>
            <th>Ventas</th>
            <th>Pedidos</th>
            <th>Promedio</th>
          </tr>
        </thead>
        <tbody>
          ${reporte.map(r => `
            <tr>
              <td>${r._id}</td>
              <td>$${r.ventas}</td>
              <td>${r.pedidos}</td>
              <td>$${Math.round(r.promedio)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <button class="btn btn-success" onclick="exportarPDF()">Exportar PDF</button>
    `;
    contenedor.classList.remove("d-none");
  } catch (err) {
    showErrorMessage("Error al generar reporte: " + err.message);
  }
}

function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Reporte de Ventas", 14, 20);

  // Extraer filas de la tabla
  const rows = [];
  document.querySelectorAll("#reporteResultado table tbody tr").forEach(tr => {
    const cols = Array.from(tr.querySelectorAll("td")).map(td => td.innerText);
    rows.push(cols);
  });

  // Generar tabla en PDF
  doc.autoTable({
    head: [["Periodo", "Ventas", "Pedidos", "Promedio"]],
    body: rows,
    startY: 30
  });

  // Descargar PDF
  doc.save("reporte.pdf");
}

function showSuccessMessage(message) {
  // Implementar notificación de éxito
  alert(message); // Temporal - Idealmente usar un toast o notificación mejor
}

function showErrorMessage(message) {
  // Implementar notificación de error
  alert(message); // Temporal - Idealmente usar un toast o notificación mejor
}
>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca
