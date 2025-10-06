document.getElementById('formAnular').addEventListener('submit', async e => {
  e.preventDefault();
  const motivo = document.getElementById('motivo').value === 'Otro'
    ? document.getElementById('motivoOtro').value
    : document.getElementById('motivo').value;
  const pedidoId = 901732; 

  try {
    await apiFetch(API_CONTRACT.pedidos.anular(pedidoId), { body: { motivo } });
    $('#modalAnular').modal('hide');
    setTimeout(() => $('#modalAnulacion').modal('show'), 400);
  } catch (err) {
    alert('No se pudo anular el pedido');
  }
});