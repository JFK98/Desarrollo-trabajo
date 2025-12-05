const express = require('express');
const Usuario = require('../models/Usuario');
const router = express.Router();

// Crear usuario
router.post('/', async (req, res) => {
  try {
    console.log('BODY RECIBIDO:', req.body); // eliminar luego solo para depuración
    const { nombre, correo, password, rol, telefono, direccion } = req.body;

    // Verificar si correo ya existe
    const existe = await Usuario.findOne({ correo });
    if (existe) {
      return res.status(400).json({ ok: false, msg: 'El correo ya está registrado' });
    }

    if (!nombre || !correo) {
      return res.status(400).json({ ok: false, msg: 'Nombre y correo son obligatorios' });
    }

    const nuevoUsuario = new Usuario({
      nombre,
      correo,
      password: password || '123456',
      rol: rol || 'encargado',
      telefono,
      direccion
    });

    await nuevoUsuario.save();

    const { password: _, ...usuarioSinPassword } = nuevoUsuario.toObject();
    res.json({ ok: true, usuario: usuarioSinPassword });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password');
    res.json({ ok: true, usuarios });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Obtener usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-password');
    if (!usuario) {
      return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    }
    res.json({ ok: true, usuario });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
  console.log('BODY RECIBIDO:', req.body);
  try {
    const { nombre, correo, rol, telefono, password, direccion } = req.body;

    // Construimos el objeto de actualización
    const updateData = { nombre, correo, rol, telefono };

    // incluir dirección si viene en el body
    if (direccion && direccion.trim() !== '') {
      updateData.direccion = direccion;
    }

    // Solo actualizar password si viene en el body
    if (password && password.trim() !== '') {
      updateData.password = password;
    }

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!usuario) {
      return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    }

    res.json({ ok: true, usuario });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) {
      return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    }
    res.json({ ok: true, msg: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

module.exports = router;