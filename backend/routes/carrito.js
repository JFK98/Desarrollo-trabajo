const express = require('express');
const Carrito = require('../models/Carrito');
const router = express.Router();

// Obtener carrito de un usuario
router.get('/:usuarioId', async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ usuarioId: req.params.usuarioId });

    if (carrito) {
      const carritoJSON = carrito.toObject();
      carritoJSON.items = carritoJSON.items.map(item => ({
        ...item,
        productoId: item.productoId.toString() 
      }));
      res.json(carritoJSON);
    } else {
      res.json({ usuarioId: req.params.usuarioId, items: [] });
    }
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Agregar producto al carrito
router.post('/agregar', async (req, res) => {
  try {
    const { usuarioId, productoId, nombre, precio, cantidad } = req.body;
    let carrito = await Carrito.findOne({ usuarioId });

    if (!carrito) {
      carrito = await Carrito.create({ usuarioId, items: [] });
    }

    //Verificar si el producto ya existe en el carrito
    const itemExistente = carrito.items.find(item => item.productoId.toString() === productoId);

    if (itemExistente) {
      // Si existe, aumentar cantidad
      itemExistente.cantidad += cantidad;
    } else {
      // Si no existe, agregar nuevo
      carrito.items.push({ productoId, nombre, precio, cantidad });
    }

    await carrito.save();
    res.json({ ok: true, carrito });
  } catch (err) {
    res.status(400).json({ ok: false, msg: err.message });
  }
});

//Actualizar cantidad de un producto
router.put('/actualizar', async (req, res) => {
  try {
    const { usuarioId, productoId, cantidad } = req.body;
    const carrito = await Carrito.findOne({ usuarioId });

    if (!carrito) {
      return res.status(404).json({ ok: false, msg: 'Carrito no encontrado' });
    }

    const item = carrito.items.find(item => item.productoId.toString() === productoId);
    if (!item) {
      return res.status(404).json({ ok: false, msg: 'Producto no encontrado en el carrito' });
    }

    item.cantidad = cantidad;
    await carrito.save();

    res.json({ ok: true, carrito });
  } catch (err) {
    res.status(400).json({ ok: false, msg: err.message });
  }
});

//Eliminar producto específico del carrito
router.delete('/eliminar', async (req, res) => {
  try {
    const { usuarioId, productoId } = req.body;
    const carrito = await Carrito.findOne({ usuarioId });

    if (!carrito) {
      return res.status(404).json({ ok: false, msg: 'Carrito no encontrado' });
    }

    carrito.items = carrito.items.filter(item => item.productoId.toString() !== productoId);
    await carrito.save();

    res.json({ ok: true, carrito });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

//Eliminar carrito completo
router.delete('/:usuarioId', async (req, res) => {
  try {
    await Carrito.findOneAndDelete({ usuarioId: req.params.usuarioId });
    res.json({ ok: true, msg: 'Carrito eliminado' });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

module.exports = router;