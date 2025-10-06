(async () => {
  try {
    const productos = await apiFetch(API_CONTRACT.productos.list);
    console.log('Productos:', productos);
  
  } catch (err) {
    console.error('Error al cargar productos', err);
  }
})();

const correo = localStorage.getItem('correo');
if (correo) {
  document.getElementById('cuentaActiva').textContent = correo;
}