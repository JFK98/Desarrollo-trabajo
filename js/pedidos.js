// Manejar detalle de pedido y anulación
document.addEventListener('DOMContentLoaded', async () => {
  try {
    
    const pedidoId = getPedidoIdFromUrl();
    const pedido = await apiFetch(API_CONTRACT.pedidos.obtener(pedidoId));
    mostrarDetallePedido(pedido);

    
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

  return '901732'; 
}

function mostrarDetallePedido(pedido) {
  
  document.querySelector('.badge-custom').textContent = `Estado: ${pedido.estado}`;
 
}