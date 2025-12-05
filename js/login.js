// Manejar el formulario de login
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);
    const correo = formData.get('correo').trim();
    const password = formData.get('password');

    if (!correo || !password) {
      alert("Por favor complete todos los campos");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Credenciales inválidas");
      }

     

      localStorage.setItem("correo", data.usuario.correo);
      localStorage.setItem("rol", data.usuario.rol);
      localStorage.setItem("nombre", data.usuario.nombre);
      localStorage.setItem("userId", data.usuario.id); 
      
      if (["admin", "encargado", "dueño"].includes(data.usuario.rol)) {
        window.location.href = "administracion.html";
      } else {
        window.location.href = "inicio.html";
      }

    } catch (err) {
      alert(err.message || "Error al iniciar sesión");
      loginForm.reset();
    }
  });
});