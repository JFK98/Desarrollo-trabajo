document.addEventListener('DOMContentLoaded', () => {
    // Agregar listener a todos los botones de "Agregar al carrito"
    document.querySelectorAll('.btn-success').forEach(button => {
        button.addEventListener('click', addToCart);
    });
});

function addToCart(event) {
    const button = event.target.closest('.btn-success'); // Aseguramos obtener el botón
    if (!button) return;

    const productData = {
        id: button.dataset.id,
        nombre: button.dataset.nombre,
        precio: parseInt(button.dataset.precio),
        imagen: button.dataset.imagen,
        cantidad: 1
    };

    try {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        
        // Buscar producto por ID único
        const existingProductIndex = carrito.findIndex(item => item.id === productData.id);
        
        if (existingProductIndex >= 0) {
            carrito[existingProductIndex].cantidad += 1;
        } else {
            carrito.push({...productData}); // Usar spread para evitar referencias
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        console.log('Carrito actualizado:', carrito); // Para debugging
        alert('Producto agregado al carrito exitosamente');

    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        alert('Error al agregar el producto al carrito');
    }
}