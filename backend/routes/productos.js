const express = require('express');
const Producto = require('../models/Producto');
const router = express.Router();

//Listar productos
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json({ ok: true, productos });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

//Crear producto
router.post('/', async (req, res) => {
  try {
    const { nombre, precio, imagen } = req.body;

    if (!nombre || !precio) {
      return res.status(400).json({ ok: false, msg: 'Nombre y precio son obligatorios' });
    }

    const nuevo = new Producto({ nombre, precio, imagen });
    await nuevo.save();

    res.status(201).json({ ok: true, producto: nuevo });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

//Actualizar producto
router.put('/:id', async (req, res) => {
  try {
    const { nombre, precio, imagen } = req.body;

    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { nombre, precio, imagen },
      { new: true, runValidators: true }
    );

    if (!producto) {
      return res.status(404).json({ ok: false, msg: 'Producto no encontrado' });
    }

    res.json({ ok: true, producto });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

//Eliminar producto
router.delete('/:id', async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);

    if (!producto) {
      return res.status(404).json({ ok: false, msg: 'Producto no encontrado' });
    }

    res.json({ ok: true, msg: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

module.exports = router;
