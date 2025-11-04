document.addEventListener('DOMContentLoaded', () => {
    // Cargar carrito al iniciar
    actualizarCarritoUI();

    // Event delegation para los botones de cantidad y eliminar
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

    // Listener para el formulario de pago
    const formPago = document.getElementById('formPago');
    if (formPago) {
        formPago.addEventListener('submit', handlePago);
    }
});

function actualizarCarritoUI() {
    const carritoItems = document.getElementById('carritoItems');
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p class="text-center">No hay productos en el carrito</p>';
        document.getElementById('totalCarrito').value = '$0';
        return;
    }

    let html = '';
    let total = 0;

    carrito.forEach(producto => {
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        html += `
            <div class="carrito-item" data-id="${producto.id}">
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
    document.getElementById('totalCarrito').value = `$${total.toLocaleString()}`;
}

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
    const usuarioId = localStorage.getItem('userId'); // 👈 guardado en login
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    try {
        if (!usuarioId) {
            throw new Error("Debes iniciar sesión para comprar");
        }
        if (carrito.length === 0) {
            throw new Error("El carrito está vacío");
        }

        // Construir pedido
        const pedido = {
        usuarioId,
        items: carrito.map(item => ({
            nombre: item.nombre,
            cantidad: item.cantidad,
            precio: item.precio
        })),
        total: carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
        direccion
        };

        // Enviar al backend
        const res = await fetch("http://localhost:3000/api/pedidos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pedido)
        });

        const data = await res.json();

        if (!res.ok || !data.ok) {
            throw new Error(data.msg || "Error al crear pedido");
        }

        // Guardar ID del pedido para mostrarlo y poder anularlo en pedidos.html
        localStorage.setItem("ultimoPedidoId", data.pedido._id);

        // Limpiar carrito
        localStorage.removeItem('carrito');

        // Redirigir a pedidos.html
        window.location.href = 'pedidos.html';

    } catch (error) {
        console.error('Error al procesar el pago:', error);
        alert(error.message || 'Error al procesar el pago');
    }
}

function validarTarjeta(numero) {
    return numero.length === 16 && !isNaN(numero);
}