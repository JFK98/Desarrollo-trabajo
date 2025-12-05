// Cargar variables de entorno desde .env
require('dotenv').config();
// Importar dependencias
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express(); 


<<<<<<< HEAD
app.use(cors());             
app.use(express.json());      

// Conectar a MongoDB
=======
app.use(cors());              
app.use(express.json());      

// Conexión a MongoDB
>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
<<<<<<< HEAD
.then(() => console.log('|-->Conectado a MongoDB<--|'))
.catch(err => {
  console.error('WARNING! Error al conectar a MongoDB:', err.message);
  process.exit(1);
});

=======
.then(() => console.log('Conectado a MongoDB'))
.catch(err => {
  console.error('Error al conectar a MongoDB:', err.message);
  process.exit(1);
});

// Ruta de prueba
>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca
app.get('/api/health', (req, res) => {
  res.json({ ok: true, msg: 'Servidor funcionando correctamente' });
});

<<<<<<< HEAD
// Importar y usar rutas
=======
// Importar rutas
>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const productosRoutes = require('./routes/productos');
const pedidosRoutes = require('./routes/pedidos');
const carritoRoutes = require('./routes/carrito');
const reportesRoutes = require('./routes/reportes');

<<<<<<< HEAD

=======
// Usar rutas
>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/reportes', reportesRoutes);


<<<<<<< HEAD
=======
// Manejo de rutas no encontradas
>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca
app.use((req, res, next) => {
  res.status(404).json({ ok: false, msg: 'Ruta no encontrada' });
});


<<<<<<< HEAD
=======
// Manejo de errores globales
>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca
app.use((err, req, res, next) => {
  console.error('Error interno:', err);
  res.status(500).json({ ok: false, msg: 'Error interno del servidor' });
});

<<<<<<< HEAD
// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`|-->Servidor escuchando en http://localhost:${PORT}/api<--|`);
});
=======
// Levantar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}/api`);
});
>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca
