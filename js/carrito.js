document.getElementById('formPago').addEventListener('submit', async e => {
  e.preventDefault();
  const tarjeta = document.getElementById('tarjeta').value.trim();
  const metodoEnvio = document.querySelector('select').value;
  const productos = [{ productoId: 1, cantidad: 2 }];

  try {
    await apiFetch(API_CONTRACT.pedidos.create, { body: { productos, metodoEnvio } });
    $('#modalPago').modal('hide');
    setTimeout(() => $('#modalPedido').modal('show'), 400);
  } catch (err) {
    $('#modalPago').modal('hide');
    setTimeout(() => $('#modalPagoFallido').modal('show'), 400);
  }
});