const express = require('express');
const Usuario = require('../models/Usuario'); 
const router = express.Router();

<<<<<<< HEAD
// Ruta para login
=======

>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca
router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;

    const usuario = await Usuario.findOne({ correo });

    if (!usuario) {
      return res.status(401).json({ ok: false, msg: 'Credenciales inválidas' });
    }

    
<<<<<<< HEAD
    if (usuario.password !== password) {
      return res.status(401).json({ ok: false, msg: 'Credenciales inválidas' });
    }

=======
>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca
    res.json({
      ok: true,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        telefono: usuario.telefono
      },
      token: "fake-jwt-token"
    });

  } catch (err) {
    res.status(500).json({ ok: false, msg: 'Error en el servidor', error: err.message });
  }
});

<<<<<<< HEAD
// Ruta para registro
=======

>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca
router.post('/registro', async (req, res) => {
  try {
    const { nombre, correo, password, rol, telefono } = req.body;

    const existe = await Usuario.findOne({ correo });
    if (existe) {
      return res.status(400).json({ ok: false, msg: 'El correo ya está registrado' });
    }

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

<<<<<<< HEAD
// Ruta para logout
=======

>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca
router.post('/logout', (req, res) => {
  res.json({ ok: true, msg: 'Sesión cerrada correctamente' });
});

module.exports = router;
