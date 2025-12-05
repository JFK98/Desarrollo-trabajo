// Manejar el formulario de registro
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registroForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value;
    const telefono = document.getElementById('telefono').value.trim();
    const direccion = document.getElementById('direccion').value.trim();

    try {
      const res = await fetch("http://localhost:3000/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          correo,
          password,
          telefono,
          direccion,
          rol: "cliente"
        })
      });

      const data = await res.json();

      if (data.ok) {
        alert("Bienvenido a FlorVida! Su cuenta ha sido creada exitosamente.");
        window.location.href = "inicio.html";
      } else {
        alert("Error en el registro: " + data.msg);
      }
    } catch (err) {
      alert("Error en el registro: " + err.message);
    }
  });
});