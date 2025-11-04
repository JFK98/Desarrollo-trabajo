const { Router } = require('express');
const Pedido = require('../models/Pedido');
const router = Router();

// Crear un nuevo pedido
router.post('/', async (req, res) => {
  try {
    const pedido = await Pedido.create(req.body);
    res.status(201).json({ ok: true, pedido });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Obtener todos los pedidos (para administración)
router.get('/', async (req, res) => {
  try {
    const pedidos = await Pedido.find()
      .populate('usuarioId', 'nombre correo')
      .populate('items.productoId', 'nombre precio');
    res.json({ ok: true, pedidos });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Obtener pedidos de un usuario
router.get('/:usuarioId', async (req, res) => {
  try {
    const pedidos = await Pedido.find({ usuarioId: req.params.usuarioId })
      .populate('items.productoId', 'nombre precio');
    res.json({ ok: true, pedidos });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Anular un pedido
router.put('/:id/anular', async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado: 'anulado', motivoAnulacion: req.body.motivo || 'Sin motivo' },
      { new: true }
    );
    if (!pedido) {
      return res.status(404).json({ ok: false, msg: 'Pedido no encontrado' });
    }
    res.json({ ok: true, pedido });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

module.exports = router;