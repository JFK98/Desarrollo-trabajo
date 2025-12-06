Caso Floreria "Flor&Vida"
Para este proyecto se utilizo node.js, express,nodemailer y mongodb,
almacenamiento en localStorage para guardar datos en el navegador para el correcto funcionamiento de la pagina
como datos del usuario (correo para mostrar quien inicio sesion),
datos de pedido,carrito,catalogo,etc.
Y uso en backend para reflejar cambios.
Se creara un usuario admin en caso de no existir en la base de datos (referencia en "/backend/seed/seed.js")
Para el correcto funcionamiento del codigo es necesario ingresar credenciales del servicio de correo en el archivo "/backend/.env"
El proyecto funciona de manera local, por lo que los usuarios, pedidos, carritos y productos no se veran reflejado en las paginas HTML
a la hora de arrancar el servidor (/backend/server.js)

Comando para iniciar el backend:
npm start (estando en la ruta "/backend")

