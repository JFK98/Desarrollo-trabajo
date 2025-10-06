document.querySelector('form').addEventListener('submit', async e => {
  e.preventDefault();
  const correo = document.getElementById('usuario').value.trim();
  const password = document.getElementById('password').value;
  const telefono = document.getElementById('telefono').value.trim();
  try {
    await apiFetch(API_CONTRACT.registrarCliente, { body: { correo, password, telefono } });
    alert('Registro exitoso. Inicia sesión.');
    window.location.href = 'login.html';
  } catch (err) {
    alert('Error al registrar');
  }
});