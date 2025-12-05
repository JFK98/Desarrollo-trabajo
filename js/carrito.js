<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', async () => {
  const usuarioId = localStorage.getItem("userId");

  // Prellenar dirección del usuario en el modal
  if (usuarioId) {
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${usuarioId}`);
      const data = await res.json();
      if (res.ok && data.ok && data.usuario.direccion) {
        const direccionField = document.getElementById("direccion");
        if (direccionField) direccionField.value = data.usuario.direccion;
      }
    } catch (err) {
      console.error("Error obteniendo dirección del usuario:", err);
=======
document.addEventListener('DOMContentLoaded', () => {
    // Cargar carrito al iniciar
    actualizarCarritoUI();
    document.getElementById('carritoItems').addEventListener('click', (e) => {
        const target = e.target;
        
        if (target.classList.contains('btn-decrease')) {
            actualizarCantidad(target, -1);
        } else if (target.classList.contains('btn-increase')) {
            actualizarCantidad(target, 1);
        } else if (target.classList.contains('btn-eliminar')) {
            eliminarProducto(target);
        }
    });

    const formPago = document.getElementById('formPago');
    if (formPago) {
        formPago.addEventListener('submit', handlePago);
>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca
    }
  }

  // Cargar carrito desde backend
  await cargarCarritoDesdeDB(usuarioId);
  actualizarCarritoUI();

  // Inicializar selección de entrega y listeners para actualizar total con envío
  setupEntregaListeners();

  // Delegación de eventos
  const carritoItemsEl = document.getElementById('carritoItems');
  if (carritoItemsEl) {
    carritoItemsEl.addEventListener('click', async (e) => {
      const target = e.target;

      if (target.classList.contains('btn-decrease')) {
        await actualizarCantidad(target, -1);
      } else if (target.classList.contains('btn-increase')) {
        await actualizarCantidad(target, 1);
      } else if (target.classList.contains('btn-eliminar')) {
        await eliminarProducto(target);
      }
    });
  }

  // Pago
  const formPago = document.getElementById('formPago');
  if (formPago) formPago.addEventListener('submit', handlePago);
});

//tarifa de envío fija
const SHIPPING_FEE = 6000;

// Configura tipo de entrega y actualiza UI de envío
function setupEntregaListeners() {
  const presencial = document.getElementById('entregaPresencial');
  const domicilio = document.getElementById('entregaDomicilio');
  const direccionField = document.getElementById('direccion');

  // Función para recalcular y mostrar total con envío
  const actualizarTotalesPago = () => {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const subtotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad || 0), 0);
    const envio = (domicilio && domicilio.checked) ? SHIPPING_FEE : 0;

    const shippingEl = document.getElementById('shippingCost');
    const totalConEnvioEl = document.getElementById('totalConEnvio');
    if (shippingEl) shippingEl.textContent = envio.toLocaleString();
    if (totalConEnvioEl) totalConEnvioEl.textContent = (subtotal + envio).toLocaleString();
  };

  // Controla si la dirección es editable
  const controlarDireccionEditable = () => {
    if (!direccionField) return;
    if (domicilio && domicilio.checked) {
      // usar la dirección registrada del usuario
      direccionField.readOnly = true;
      direccionField.classList.add('bg-light');
    } else {
      direccionField.readOnly = false;
      direccionField.classList.remove('bg-light');
    }
  };

  if (presencial) presencial.addEventListener('change', () => {
    controlarDireccionEditable();
    actualizarTotalesPago();
  });
  if (domicilio) domicilio.addEventListener('change', () => {
    controlarDireccionEditable();
    actualizarTotalesPago();
  });

  controlarDireccionEditable();
  actualizarTotalesPago();

  const carritoItemsEl2 = document.getElementById('carritoItems');
  if (carritoItemsEl2) carritoItemsEl2.addEventListener('DOMSubtreeModified', actualizarTotalesPago);
}

// Obtener carrito desde DB y guardarlo en localStorage
async function cargarCarritoDesdeDB(usuarioId) {
  if (!usuarioId) return;
  try {
    const res = await fetch(`http://localhost:3000/api/carritos/${usuarioId}`);
    const data = await res.json();
    if (res.ok && data.items) {
      localStorage.setItem('carrito', JSON.stringify(data.items));
    }
  } catch (err) {
    console.error("Error cargando carrito desde DB:", err);
  }
}

// Actualizar interfaz del carrito
function actualizarCarritoUI() {
  const carritoItems = document.getElementById('carritoItems');
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  if (!carritoItems) return;

  if (carrito.length === 0) {
    carritoItems.innerHTML = '<p class="text-center">No hay productos en el carrito</p>';
    const totalInput = document.getElementById('totalCarrito');
    if (totalInput) totalInput.value = '$0';
    const totalConEnvioEl = document.getElementById('totalConEnvio');
    if (totalConEnvioEl) totalConEnvioEl.textContent = '0';
    const shippingEl = document.getElementById('shippingCost');
    if (shippingEl) shippingEl.textContent = '0';
    return;
  }

  let html = '';
  let total = 0;

  carrito.forEach(producto => {
    const subtotal = producto.precio * producto.cantidad;
    total += subtotal;

    html += `
      <div class="carrito-item" data-id="${producto.productoId}">
        <div class="row">
          <div class="col-sm-6">
            <h4>${producto.nombre}</h4>
            <p>Precio: $${producto.precio.toLocaleString()}</p>
          </div>
          <div class="col-sm-6">
            <div class="form-group">
              <label>Cantidad:</label>
              <div class="input-group quantity-control">
                <span class="input-group-btn">
                  <button class="btn btn-default btn-decrease" type="button">-</button>
                </span>
                <input type="number" class="form-control cantidad-producto" 
                  value="${producto.cantidad}" min="1" readonly>
                <span class="input-group-btn">
                  <button class="btn btn-default btn-increase" type="button">+</button>
                </span>
              </div>
              <p class="item-total">Subtotal: $${subtotal.toLocaleString()}</p>
              <button class="btn btn-danger btn-sm btn-eliminar">
                <span class="glyphicon glyphicon-trash"></span> Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  carritoItems.innerHTML = html;
  const totalInput = document.getElementById('totalCarrito');
  if (totalInput) totalInput.value = `$${total.toLocaleString()}`;

  // actualizar total con envío
  const domicilioRadio = document.getElementById('entregaDomicilio');
  const envio = (domicilioRadio && domicilioRadio.checked) ? SHIPPING_FEE : 0;
  const totalConEnvioEl = document.getElementById('totalConEnvio');
  if (totalConEnvioEl) totalConEnvioEl.textContent = (total + envio).toLocaleString();

  const shippingEl = document.getElementById('shippingCost');
  if (shippingEl) shippingEl.textContent = envio.toLocaleString();
}

// Actualizar cantidad de un producto en el carrito
async function actualizarCantidad(button, cambio) {
  const item = button.closest('.carrito-item');
  if (!item) return;
  const productoId = item.dataset.id; 
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  
  const i = carrito.findIndex(p => String(p.productoId) === String(productoId));
  if (i !== -1) {
    const nuevaCantidad = carrito[i].cantidad + cambio;

    if (nuevaCantidad > 0) {
      carrito[i].cantidad = nuevaCantidad;
      localStorage.setItem('carrito', JSON.stringify(carrito));

      //Actualizar en DB (MongoDB)
      const usuarioId = localStorage.getItem("userId");
      try {
        await fetch("http://localhost:3000/api/carritos/actualizar", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuarioId, productoId, cantidad: nuevaCantidad })
        });
      } catch (err) {
        console.error("Error actualizando carrito en DB:", err);
      }

      //Actualizar DOM
      const cantidadInput = item.querySelector(".cantidad-producto");
      if (cantidadInput) cantidadInput.value = nuevaCantidad;
      const subtotal = carrito[i].precio * nuevaCantidad;
      const itemTotalEl = item.querySelector(".item-total");
      if (itemTotalEl) itemTotalEl.textContent = `Subtotal: $${subtotal.toLocaleString()}`;

      //Recalcular total
      const total = carrito.reduce((acc, prod) => acc + prod.precio * prod.cantidad, 0);
      const totalInput = document.getElementById('totalCarrito');
      if (totalInput) totalInput.value = `$${total.toLocaleString()}`;

      // actualizar totales en modal si existe
      const domicilioRadio = document.getElementById('entregaDomicilio');
      const envio = (domicilioRadio && domicilioRadio.checked) ? SHIPPING_FEE : 0;
      const totalConEnvioEl = document.getElementById('totalConEnvio');
      if (totalConEnvioEl) totalConEnvioEl.textContent = (total + envio).toLocaleString();
      const shippingEl = document.getElementById('shippingCost');
      if (shippingEl) shippingEl.textContent = envio.toLocaleString();
    } else {
      //Si la cantidad llega a 0 se elimina el producto
      await eliminarProducto(item.querySelector(".btn-eliminar"));
    }
  }
}

// Eliminar producto del carrito
async function eliminarProducto(button) {
  const item = button.closest('.carrito-item');
  if (!item) return;
  const productoId = item.dataset.id;
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  
  carrito = carrito.filter(p => String(p.productoId) !== String(productoId));
  localStorage.setItem('carrito', JSON.stringify(carrito));

  // Eliminar en DB (MongoDB)
  const usuarioId = localStorage.getItem("userId");
  try {
    await fetch("http://localhost:3000/api/carritos/eliminar", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId, productoId })
    });
  } catch (err) {
    console.error("Error eliminando producto en DB:", err);
  }

  //Remover del DOM
  item.remove();

  //Recalcular total
  const total = carrito.reduce((acc, prod) => acc + prod.precio * prod.cantidad, 0);
  const totalInput = document.getElementById('totalCarrito');
  if (totalInput) totalInput.value = `$${total.toLocaleString()}`;

  
  const domicilioRadio = document.getElementById('entregaDomicilio');
  const envio = (domicilioRadio && domicilioRadio.checked) ? SHIPPING_FEE : 0;
  const totalConEnvioEl = document.getElementById('totalConEnvio');
  if (totalConEnvioEl) totalConEnvioEl.textContent = (total + envio).toLocaleString();
  const shippingEl = document.getElementById('shippingCost');
  if (shippingEl) shippingEl.textContent = envio.toLocaleString();

  //Si el carrito esta vacío mostrar mensaje
  if (carrito.length === 0) {
    const carritoItemsEl = document.getElementById('carritoItems');
    if (carritoItemsEl) carritoItemsEl.innerHTML = '<p class="text-center">No hay productos en el carrito</p>';
  }
}

// Manejar el proceso de pago simulado (sin API de pago real)
async function handlePago(e) {
  e.preventDefault();

  const direccion = document.getElementById('direccion') ? document.getElementById('direccion').value.trim() : '';
  const entregaTipo = document.querySelector('input[name="entregaTipo"]:checked')?.value || 'presencial';
  const usuarioId = localStorage.getItem('userId'); 
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  try {
    if (!usuarioId) throw new Error("Debes iniciar sesión para comprar");
    if (carrito.length === 0) throw new Error("El carrito está vacío");

    // Validar si es envío a domicilio
    if (entregaTipo === 'domicilio') {
      if (!direccion) throw new Error("No existe dirección registrada para envío a domicilio");
    }

    // Crear pedido con costo de envio si aplica
    const shippingCost = (entregaTipo === 'domicilio') ? SHIPPING_FEE : 0;

    const pedido = {
      usuarioId,
      items: carrito.map(item => ({
        productoId: item.productoId || item.id, 
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio
      })),
      total: carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0) + shippingCost,
      direccion, 
      entregaTipo,
      shippingCost
    };
    console.log("Pedido a enviar:", pedido); // para debugging

    const res = await fetch("http://localhost:3000/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido)
    });

    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.msg || "Error al crear pedido");

<<<<<<< HEAD
    localStorage.setItem("ultimoPedidoId", data.pedido._id);
=======
function actualizarCantidad(button, cambio) {
    const item = button.closest('.carrito-item');
    const id = item.dataset.id;
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    const productoIndex = carrito.findIndex(p => p.id === id);
    if (productoIndex !== -1) {
        const nuevaCantidad = carrito[productoIndex].cantidad + cambio;
        if (nuevaCantidad > 0) {
            carrito[productoIndex].cantidad = nuevaCantidad;
            localStorage.setItem('carrito', JSON.stringify(carrito));
            actualizarCarritoUI();
        }
    }
}

function eliminarProducto(button) {
    if (confirm('¿Está seguro de eliminar este producto?')) {
        const item = button.closest('.carrito-item');
        const id = item.dataset.id;
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        
        carrito = carrito.filter(p => p.id !== id);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarCarritoUI();
    }
}

async function handlePago(e) {
    e.preventDefault();
    
    const direccion = document.getElementById('direccion').value;
    const usuarioId = localStorage.getItem('userId'); 
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca

    // Vaciar carrito en DB y local
    try {
      await fetch(`http://localhost:3000/api/carritos/${usuarioId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Error vaciando carrito en DB:", err);
    }
    localStorage.removeItem('carrito');

    window.location.href = 'pedidos.html';

  } catch (error) {
    console.error('Error al procesar el pago:', error);
    alert(error.message || 'Error al procesar el pago');
  }
}

// Validar número de tarjeta (sin verificar otros campos como CVV o fecha o tipo de marca de la tarjeta ej Visa o el pais de esta)
function validarTarjeta(numero) {
<<<<<<< HEAD
  return String(numero).replace(/\s+/g,'').length === 16 && !isNaN(String(numero).replace(/\s+/g,''));
}
=======
    return numero.length === 16 && !isNaN(numero);
}
>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca
