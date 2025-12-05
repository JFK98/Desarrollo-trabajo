//Listener global para AGREGAR AL CARRITO

document.addEventListener('click', function(e) {
    const button = e.target.closest('.btn-agregar-carrito');
    if (!button) return;

    addToCart({ target: button });
});

//Función para agregar productos al carrito

async function addToCart(event) {
  const button = event.target.closest('.btn-success');
  if (!button) return;

  const productData = {
    productoId: button.dataset.id,   
    nombre: button.dataset.nombre,
    precio: parseInt(button.dataset.precio),
    imagen: button.dataset.imagen,
    cantidad: 1
  };

  try {
    const usuarioId = localStorage.getItem("userId");
    if (!usuarioId) {
      alert("Debes iniciar sesión para agregar productos al carrito");
      return;
    }

    //Guardar en backend (carrito)
    await fetch("http://localhost:3000/api/carrito/agregar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId, ...productData })
    });

    //Actualizar localStorage
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const existingProductIndex = carrito.findIndex(
      item => String(item.productoId) === String(productData.productoId)
    );

    if (existingProductIndex >= 0) {
      carrito[existingProductIndex].cantidad += 1;
    } else {
      carrito.push(productData);
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert('Producto agregado al carrito exitosamente');

  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    alert('Error al agregar el producto al carrito');
  }
}

//Función para CREAR PEDIDO desde carrito

async function crearPedido() {
  const usuarioId = localStorage.getItem("userId");
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const direccion = document.getElementById("direccionEnvio").value;

  const pedido = {
    usuarioId,
    items: carrito.map(item => ({
      productoId: item.productoId || item.id,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precio
    })),
    total: carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
    direccion
  };

  const res = await fetch("http://localhost:3000/api/pedidos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido)
  });

  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.msg || "Error al crear pedido");
}

//Cargar productos por temporada

async function cargarProductosPorTemporada() {
    try {
        const res = await fetch('http://localhost:3000/api/productos');
        const data = await res.json();

        if (!data.ok) return;

        const productos = data.productos;

        // Limpiar contenedores
        document.getElementById('listaPrimavera').innerHTML = '';
        document.getElementById('listaVerano').innerHTML = '';
        document.getElementById('listaOtono').innerHTML = '';
        document.getElementById('listaInvierno').innerHTML = '';

        productos.forEach(p => {
            const card = crearCardProducto(p);

            switch (p.temporada) {
                case 'primavera':
                    listaPrimavera.appendChild(card);
                    break;
                case 'verano':
                    listaVerano.appendChild(card);
                    break;
                case 'otoño':
                    listaOtono.appendChild(card);
                    break;
                case 'invierno':
                    listaInvierno.appendChild(card);
                    break;
            }
        });

    } catch (err) {
        console.error('Error cargando productos:', err);
    }
}

//Crear card de producto
function crearCardProducto(p) {
    const div = document.createElement('div');
    div.className = 'col-sm-4 mb-4';

    let panelClass = 'panel-primary';

    div.innerHTML = `
        <div class="panel ${panelClass}">
            <div class="panel-heading">${p._id}</div>

            <div class="panel-body">
                <img src="${p.imagen || 'imagenes/default.jpg'}"
                     class="img-responsive"
                     style="width:100%"
                     alt="${p.nombre}">
            </div>

            <div class="panel-footer">
                ${p.nombre}<br>
                ${p.precio.toLocaleString('es-CL')}
            </div>

            <button class="btn btn-success btn-block btn-agregar-carrito"
                data-id="${p._id}"
                data-nombre="${p.nombre}"
                data-precio="${p.precio}"
                data-imagen="${p.imagen}">
                Agregar al carrito
            </button>
        </div>
    `;

    return div;
}

//Ejecutar carga al iniciar la página

document.addEventListener('DOMContentLoaded', cargarProductosPorTemporada);