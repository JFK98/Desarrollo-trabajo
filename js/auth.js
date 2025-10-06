document.addEventListener('DOMContentLoaded', () => {
  const desdeLogout = sessionStorage.getItem('desdeLogout');
  const pagina = window.location.pathname.split('/').pop();

  if (desdeLogout && pagina === 'inicio.html') {
    sessionStorage.removeItem('desdeLogout'); 
    return; 
  }

});

document.addEventListener('DOMContentLoaded', () => {

    const logout = sessionStorage.getItem('logout');
    const pagina = window.location.pathname.split('/').pop();

    if (logout && pagina === 'inicio.html') {
    sessionStorage.removeItem('logout'); 
    return; 
    }
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');
  const correo = localStorage.getItem('correo');

  
  const pagina = window.location.pathname.split('/').pop();

  
  const reglas = {
    'administracion.html': 'administrador',
    'carrito.html': 'cliente'
    
  };

  const rolRequerido = reglas[pagina];

  
  if (!rolRequerido) {
    return;
  }

  if (!token || !rol || rol !== rolRequerido) {
    alert('Acceso no autorizado');
    window.location.href = 'login.html';
    return;
  }

 
  const iconoUsuario = document.querySelector('.bi-person-circle');
  if (iconoUsuario && correo) {
    iconoUsuario.insertAdjacentHTML('afterend', `<span style="margin-left:10px;">${correo}</span>`);
  }
});