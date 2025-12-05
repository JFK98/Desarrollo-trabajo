const express = require('express');
const Producto = require('../models/Producto');
const router = express.Router();

<<<<<<< HEAD

//Listar productos ordenados por temporada y nombre
=======
//Listar productos
>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca
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

<<<<<<< HEAD

=======
>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca
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

<<<<<<< HEAD

=======
>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca
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

<<<<<<< HEAD

=======
>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca
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

<<<<<<< HEAD

module.exports = router;
=======
module.exports = router;
>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca
