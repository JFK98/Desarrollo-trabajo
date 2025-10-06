document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  if (!token || rol !== 'administrador') {
    alert('Acceso no autorizado');
    window.location.href = 'login.html';
  }
});
(function () {
  const rol = localStorage.getItem('rol');
  if (!rol || !['admin', 'encargado', 'dueño'].includes(rol)) {
    alert('Acceso no autorizado');
    window.location.href = 'login.html';
    return;
  }

  document.querySelector('#modalCrear form').addEventListener('submit', async e => {
    e.preventDefault();
    const nombre = e.target.querySelector('input[type="text"]').value;
    const correo = e.target.querySelector('input[type="email"]').value;
    try {
      await apiFetch(API_CONTRACT.usuarios.create, {
        body: { nombre, correo, rol: 'encargado', password: '123456' }
      });
      alert('Usuario creado');
    } catch (err) {
      alert('Error al crear usuario');
    }
  });

  document.getElementById('btnConsultar').addEventListener('click', async () => {
    const periodo = document.querySelector('#formReporte select').value;
    try {
      const reporte = await apiFetch(API_CONTRACT.reportes.get(periodo));
      document.getElementById('reporteResultado').classList.remove('d-none');
      console.log('Reporte:', reporte);
    } catch (err) {
      alert('Error al consultar reporte');
    }
  });
})();


