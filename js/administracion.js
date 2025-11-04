document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  // Verificar autorización
  if (!rol || !['admin', 'encargado', 'dueño'].includes(rol)) {
    alert('Acceso no autorizado');
    window.location.href = 'login.html';
    return;
  }

  // Inicializar eventos
  initializeEvents();
  
  // Cargar datos iniciales
  await loadInitialData();
});

function initializeEvents() {
  // Evento para crear usuario
  const formCrearUsuario = document.querySelector('#modalCrear form');
  if (formCrearUsuario) {
    formCrearUsuario.addEventListener('submit', handleCreateUser);
  }

  // Evento para generar reportes
  const btnConsultar = document.getElementById('btnConsultar');
  if (btnConsultar) {
    btnConsultar.addEventListener('click', () => {
      const tipo = document.querySelector("#formReporte select").value;
      generarReporte(tipo);
    });
  }

  // Evento para crear producto
  const formCrearProducto = document.getElementById('crearProductoForm');
  if (formCrearProducto) {
    formCrearProducto.addEventListener('submit', handleCreateProduct);
  }

  // Eventos para el menú lateral
  document.querySelectorAll('#sidebarMenu .nav-link').forEach(link => {
    link.addEventListener('click', handleMenuChange);
  });

  // Evento para cerrar sesión
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', handleLogout);
  }
}

async function handleCreateUser(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  try {
    await apiFetch(API_CONTRACT.usuarios.crear, {
      body: {
        nombre: formData.get('nombre'),
        correo: formData.get('correo'),
        rol: formData.get('rol') || 'encargado',
        password: formData.get('password') || '123456'
      }
    });

    showSuccessMessage('Usuario creado exitosamente');
    $('#modalCrear').modal('hide');
    await loadUsers(); // Recargar lista de usuarios

  } catch (err) {
    showErrorMessage('Error al crear usuario: ' + err.message);
  }
}

async function handleCreateProduct(e) {
  e.preventDefault();
  const formData = new FormData(e.target);

  try {
    await apiFetch(API_CONTRACT.productos.crear, {
      body: {
        nombre: formData.get('nombre'),
        precio: formData.get('precio'),
        stock: formData.get('stock'),
        categoria: formData.get('categoria'),
        imagen: formData.get('imagen')
      }
    });

    showSuccessMessage('Producto creado exitosamente');
    $('#modalCrearProducto').modal('hide');
    e.target.reset();
    await loadProducts(); // recargar lista

  } catch (err) {
    showErrorMessage('Error al crear producto: ' + err.message);
  }
}

async function loadProducts() {
  try {
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
  } catch (err) {
    showErrorMessage("Error al cargar productos: " + err.message);
  }
}

async function loadOrders() {
  try {
    const data = await apiFetch(API_CONTRACT.pedidos.listar);
    console.log("Pedidos recibidos:", data); 

    // El backend devuelve { ok: true, pedidos: [...] }
    const pedidos = data.pedidos || [];
    const tbody = document.querySelector("#pedidosTable tbody");

    tbody.innerHTML = pedidos.map(p => `
      <tr>
        <td>${p._id}</td>
        <td>${p.usuarioId?.correo || p.usuarioId?.nombre || '-'}</td>
        <td>${p.fecha ? new Date(p.fecha).toLocaleDateString() : '-'}</td>
        <td>$${p.total ?? 0}</td>
        <td>${p.estado ?? 'pendiente'}</td>
      </tr>
    `).join("");
  } catch (err) {
    showErrorMessage("Error al cargar pedidos: " + err.message);
  }
}

async function eliminarProducto(id) {
  if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

  try {
    await apiFetch(API_CONTRACT.productos.eliminar(id));
    showSuccessMessage("Producto eliminado");
    await loadProducts();
  } catch (err) {
    showErrorMessage("Error al eliminar producto: " + err.message);
  }
}

async function handleGenerateReport() {
  const periodo = document.querySelector('#formReporte select').value;
  const reporteContainer = document.getElementById('reporteResultado');

  try {
    reporteContainer.innerHTML = '<div class="text-center"><div class="spinner-border"></div></div>';
    reporteContainer.classList.remove('d-none');

    const reporte = await apiFetch(API_CONTRACT.reportes.ventas, {
      params: { periodo }
    });

    displayReport(reporte, reporteContainer);

  } catch (err) {
    showErrorMessage('Error al generar reporte: ' + err.message);
    reporteContainer.classList.add('d-none');
  }
}

async function handleMenuChange(e) {
  e.preventDefault();
  const section = e.target.dataset.section;

  // Actualizar UI
  document.querySelectorAll('.section-content').forEach(sec => {
    sec.classList.add('d-none');
  });
  document.getElementById(section)?.classList.remove('d-none');

  // Cargar datos según sección
  switch(section) {
    case 'usuarios':
      await loadUsers();
      break;
    case 'productos':
      await loadProducts();
      break;
    case 'pedidos':
      await loadOrders();
      break;
  }
}

async function handleLogout() {
  try {
    await apiFetch(API_CONTRACT.auth.logout);
    localStorage.clear();
    window.location.href = 'login.html';
  } catch (err) {
    showErrorMessage('Error al cerrar sesión');
  }
}

async function loadInitialData() {
  try {
    const defaultSection = document.querySelector('#sidebarMenu .nav-link.active')?.dataset.section || 'dashboard';
    document.getElementById(defaultSection)?.classList.remove('d-none');

    // Cargar datos de la sección por defecto
    switch(defaultSection) {
      case 'dashboard':
        await loadDashboardData();
        break;
      case 'usuarios':
        await loadUsers();
        break;
      // ...otros casos
    }

  } catch (err) {
    showErrorMessage('Error al cargar datos iniciales');
  }
}

async function loadDashboardData() {
  try {
    const [ventasData, inventarioData] = await Promise.all([
      apiFetch(API_CONTRACT.reportes.ventas),
      apiFetch(API_CONTRACT.reportes.inventario)
    ]);

    // Actualizar widgets del dashboard
    updateDashboardUI(ventasData, inventarioData);

  } catch (err) {
    showErrorMessage('Error al cargar dashboard');
  }
}

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
