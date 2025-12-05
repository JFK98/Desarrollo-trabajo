// Cargar variables de entorno desde .env
require('dotenv').config();
// Importar dependencias
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express(); 


app.use(cors());             
app.use(express.json());      

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('|-->Conectado a MongoDB<--|'))
.catch(err => {
  console.error('WARNING! Error al conectar a MongoDB:', err.message);
  process.exit(1);
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, msg: 'Servidor funcionando correctamente' });
});

// Importar y usar rutas
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const productosRoutes = require('./routes/productos');
const pedidosRoutes = require('./routes/pedidos');
const carritoRoutes = require('./routes/carrito');
const reportesRoutes = require('./routes/reportes');


app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/reportes', reportesRoutes);


app.use((req, res, next) => {
  res.status(404).json({ ok: false, msg: 'Ruta no encontrada' });
});


app.use((err, req, res, next) => {
  console.error('Error interno:', err);
  res.status(500).json({ ok: false, msg: 'Error interno del servidor' });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`|-->Servidor escuchando en http://localhost:${PORT}/api<--|`);
});