const express = require('express');
const Usuario = require('../models/Usuario');
const router = express.Router();

// 📌 Crear usuario
router.post('/', async (req, res) => {
  try {
    const { nombre, correo, password, rol } = req.body;

    if (!nombre || !correo) {
      return res.status(400).json({ ok: false, msg: 'Nombre y correo son obligatorios' });
    }

    const nuevoUsuario = new Usuario({
      nombre,
      correo,
      password: password || '123456', // ⚠️ idealmente encriptar con bcrypt
      rol: rol || 'encargado'
    });

    await nuevoUsuario.save();

    // Devolver sin password
    const { password: _, ...usuarioSinPassword } = nuevoUsuario.toObject();
    res.json({ ok: true, usuario: usuarioSinPassword });

  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// 📌 Listar todos los usuarios (sin password)
router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password');
    res.json({ ok: true, usuarios });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// 📌 Obtener usuario por ID (sin password)
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

// 📌 Actualizar usuario por ID
router.put('/:id', async (req, res) => {
  try {
    const { nombre, correo, rol } = req.body;

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { nombre, correo, rol },
      { new: true, runValidators: true, select: '-password' }
    );

    if (!usuario) {
      return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    }

    res.json({ ok: true, usuario });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// 📌 Eliminar usuario por ID
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