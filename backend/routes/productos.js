const express = require('express');
const Producto = require('../models/Producto');
const router = express.Router();


//Listar productos ordenados por temporada y nombre
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find().sort({ temporada: 1, nombre: 1 });

    res.json({
      ok: true,
      productos
    });

  } catch (err) {
    res.status(500).json({
      ok: false,
      msg: err.message
    });
  }
});


//Crear producto
router.post('/', async (req, res) => {
  try {
    const { nombre, precio, stock, imagen, temporada } = req.body;

    if (!nombre || !precio || !temporada) {
      return res.status(400).json({
        ok: false,
        msg: 'Nombre, precio y temporada son obligatorios'
      });
    }

    const nuevoProducto = new Producto({
      nombre,
      precio,
      stock,
      imagen,
      temporada
    });

    await nuevoProducto.save();

    res.status(201).json({
      ok: true,
      producto: nuevoProducto
    });

  } catch (err) {
    res.status(500).json({
      ok: false,
      msg: err.message
    });
  }
});


//Actualizar producto
router.put('/:id', async (req, res) => {
  try {
    const { nombre, precio, stock, imagen, temporada } = req.body;

    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { nombre, precio, stock, imagen, temporada },
      { new: true, runValidators: true }
    );

    if (!producto) {
      return res.status(404).json({
        ok: false,
        msg: 'Producto no encontrado'
      });
    }

    res.json({ ok: true, producto });

  } catch (err) {
    res.status(500).json({
      ok: false,
      msg: err.message
    });
  }
});


//Eliminar producto
router.delete('/:id', async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);

    if (!producto) {
      return res.status(404).json({
        ok: false,
        msg: 'Producto no encontrado'
      });
    }

    res.json({ ok: true, msg: 'Producto eliminado' });

  } catch (err) {
    res.status(500).json({
      ok: false,
      msg: err.message
    });
  }
});


module.exports = router;