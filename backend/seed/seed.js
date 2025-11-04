require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');

(async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Crear usuario admin si no existe
    const admin = await Usuario.findOne({ correo: 'admin@florvida.cl' });
    if (!admin) {
      await Usuario.create({
        nombre: 'Administrador',
        correo: 'admin@florvida.cl',
        password: '123456',
        rol: 'admin',
        telefono: '987654321'
      });
      console.log('✅ Usuario admin creado');
    }

    // Insertar productos de ejemplo si no hay
    const count = await Producto.countDocuments();
    if (count === 0) {
      await Producto.insertMany([
        { nombre: 'Ramo de rosas', precio: 50000, stock: 10, categoria: 'Flores' },
        { nombre: 'Ramo de rosas blancas', precio: 55000, stock: 8, categoria: 'Flores' }
      ]);
      console.log('✅ Productos de ejemplo insertados');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en seed:', err);
    process.exit(1);
  }
})();