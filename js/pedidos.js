document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Cargar detalles del pedido
    const pedidoId = getPedidoIdFromUrl();
    const pedido = await apiFetch(API_CONTRACT.pedidos.obtener(pedidoId));
    mostrarDetallePedido(pedido);

    // Listener para anulación
    document.getElementById('formAnular').addEventListener('submit', async (e) => {
      e.preventDefault();
      const motivo = document.getElementById('motivo').value === 'Otro'
        ? document.getElementById('motivoOtro').value
        : document.getElementById('motivo').value;

      try {
        await apiFetch(API_CONTRACT.pedidos.anular(pedidoId), {
          body: { motivo }
        });
        $('#modalAnular').modal('hide');
        setTimeout(() => $('#modalAnulacion').modal('show'), 400);
      } catch (err) {
        alert('Error al anular pedido');
      }
    });

  } catch (err) {
    console.error('Error al cargar pedido:', err);
  }
});

function getPedidoIdFromUrl() {
  // Obtener ID del pedido de la URL
  return '901732'; // Por ahora hardcoded
}

function mostrarDetallePedido(pedido) {
  // Actualizar UI con detalles del pedido
  document.querySelector('.badge-custom').textContent = `Estado: ${pedido.estado}`;
  // ... más actualizaciones de UI
}