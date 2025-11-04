const express = require('express');
const Carrito = require('../models/Carrito');
const router = express.Router();


router.get('/:usuarioId', async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ usuarioId: req.params.usuarioId });
    res.json(carrito || { usuarioId: req.params.usuarioId, items: [] });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Agregar item al carrito
router.post('/agregar', async (req, res) => {
  try {
    const { usuarioId, productoId, nombre, precio, cantidad } = req.body;
    let carrito = await Carrito.findOne({ usuarioId });

    if (!carrito) {
      carrito = await Carrito.create({ usuarioId, items: [] });
    }

    carrito.items.push({ productoId, nombre, precio, cantidad });
    await carrito.save();

    res.json(carrito);
  } catch (err) {
    res.status(400).json({ ok: false, msg: err.message });
  }
});

// Vaciar carrito
router.delete('/:usuarioId', async (req, res) => {
  try {
    await Carrito.findOneAndDelete({ usuarioId: req.params.usuarioId });
    res.json({ ok: true, msg: 'Carrito eliminado' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

module.exports = router;
