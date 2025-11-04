document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registroForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value;
    const telefono = document.getElementById('telefono').value.trim();

    try {
      await apiFetch(API_CONTRACT.auth.registro, {
        body: {
          correo: usuario,
          password,
          telefono
        }
      });

      alert('Registro exitoso');
      window.location.href = 'login.html';
    } catch (err) {
      alert('Error en el registro: ' + err.message);
    }
  });
});