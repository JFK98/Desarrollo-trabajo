// Cargar variables de entorno desde .env
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express(); // 👈 primero creamos la app

// =======================
// Middlewares
// =======================
app.use(cors());              // Permite que tu frontend acceda al backend
app.use(express.json());      // Para leer JSON en las peticiones

// =======================
// Conexión a MongoDB
// =======================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => {
  console.error('❌ Error al conectar a MongoDB:', err.message);
  process.exit(1);
});

// =======================
// Ruta de prueba
// =======================
app.get('/api/health', (req, res) => {
  res.json({ ok: true, msg: 'Servidor funcionando correctamente' });
});

// =======================
// Importar rutas
// =======================
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const productosRoutes = require('./routes/productos');
const pedidosRoutes = require('./routes/pedidos');
const carritoRoutes = require('./routes/carrito');
const reportesRoutes = require('./routes/reportes');

// =======================
// Usar rutas
// =======================
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/reportes', reportesRoutes);

// =======================
// Manejo de rutas no encontradas
// =======================
app.use((req, res, next) => {
  res.status(404).json({ ok: false, msg: 'Ruta no encontrada' });
});

// =======================
// Manejo de errores global
// =======================
app.use((err, req, res, next) => {
  console.error('❌ Error interno:', err);
  res.status(500).json({ ok: false, msg: 'Error interno del servidor' });
});

// =======================
// Levantar servidor
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}/api`);
});