document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  // manejo de roles para acceder a la pagina correcta
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const correo = emailInput.value.trim();
    const password = passwordInput.value;
    try {
      const data = await apiFetch(API_CONTRACT.login, { body: { correo, password } });
      localStorage.setItem('token', data.token);
      localStorage.setItem('rol', data.usuario.rol);
      localStorage.setItem('correo', data.usuario.correo);
      window.location.href = data.usuario.rol === 'administrador' ? 'administracion.html' : 'inicio.html';
    } catch (err) {
      alert(err.body?.error || 'Credenciales inválidas');
    }
  });

  // login como administrador de prueba
  document.getElementById('loginAdmin').addEventListener('click', () => {
    localStorage.setItem('token', 'fake-token-admin');
    localStorage.setItem('rol', 'administrador');
    localStorage.setItem('correo', 'admin@floryvida.cl');
    window.location.href = 'administracion.html';
  });

  // login como cliente de prueba
  document.getElementById('loginCliente').addEventListener('click', () => {
    localStorage.setItem('token', 'fake-token-cliente');
    localStorage.setItem('rol', 'cliente');
    localStorage.setItem('correo', 'cliente@floryvida.cl');
    window.location.href = 'inicio.html';
  });
});
