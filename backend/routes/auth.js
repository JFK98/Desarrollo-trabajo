const express = require('express');
const Usuario = require('../models/Usuario'); 
const router = express.Router();


router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;

    // Buscar usuario en la base de datos
    const usuario = await Usuario.findOne({ correo, password });

    if (!usuario) {
      return res.status(401).json({ ok: false, msg: 'Credenciales inválidas' });
    }

    
    res.json({
      ok: true,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        telefono: usuario.telefono
      },
      // ⚠️ Aquí podrías generar un JWT en producción
      token: "fake-jwt-token" 
    });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error en el servidor', error: err.message });
  }
});


router.post('/registro', async (req, res) => {
  try {
    const { nombre, correo, password, rol, telefono } = req.body;

    // Verificar si ya existe un usuario con ese correo
    const existe = await Usuario.findOne({ correo });
    if (existe) {
      return res.status(400).json({ ok: false, msg: 'El correo ya está registrado' });
    }

    // Crear nuevo usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      password, 
      rol: rol || 'cliente',
      telefono
    });

    res.status(201).json({
      ok: true,
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol,
        telefono: nuevoUsuario.telefono
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error en el servidor', error: err.message });
  }
});


router.post('/logout', (req, res) => {
  res.json({ ok: true, msg: 'Sesión cerrada correctamente' });
});

module.exports = router;
