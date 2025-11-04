document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(loginForm);
      
      try {
        const response = await apiFetch(API_CONTRACT.auth.login, {
          body: {
            correo: formData.get('correo'),
            password: formData.get('password')
          }
        });

        localStorage.setItem('token', response.token);
        localStorage.setItem('correo', response.usuario.correo);
        localStorage.setItem('rol', response.usuario.rol);

        window.location.href = 'inicio.html';

      } catch (error) {
        console.error('Error login:', error);
        alert('Error al iniciar sesión');
      }
    });
  }
});

async function logout() {
  try {
    await apiFetch(API_CONTRACT.auth.logout);
    localStorage.clear();
    window.location.href = 'inicio.html';
  } catch (error) {
    console.error('Error logout:', error);
  }
}