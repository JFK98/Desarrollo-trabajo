require('dotenv').config();
const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');

(async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    //Crear usuario admin si no existe
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
    } else {
      console.log('ℹ️ Usuario admin ya existe');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en seed:', err);
    process.exit(1);
  }
})();