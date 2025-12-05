const { Router } = require('express');
const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');
const { enviarBoleta } = require('../utils/mailer');
const router = Router();

// Costo de envío
const DEFAULT_SHIPPING_COST = 6000;

// Crear pedido con actualización de stock
router.post('/', async (req, res) => {
  try {
    // Normalizar campos de entrega
    const entregaTipo = (req.body.entregaTipo === 'domicilio') ? 'domicilio' : 'presencial';
    let shippingCost = typeof req.body.shippingCost !== 'undefined' ? Number(req.body.shippingCost) : 0;
    if (isNaN(shippingCost) || shippingCost < 0) shippingCost = 0;

    // Si entrega es domicilio, exigir dirección
    if (entregaTipo === 'domicilio' && (!req.body.direccion || String(req.body.direccion).trim() === '')) {
      return res.status(400).json({ ok: false, msg: 'Dirección requerida para envío a domicilio' });
    }

    // Validar items presentes
    if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({ ok: false, msg: 'El pedido debe contener al menos un item' });
    }

    // Validar stock antes de crear
    for (const item of req.body.items) {
      const producto = await Producto.findById(item.productoId);
      if (!producto) {
        return res.status(404).json({ ok: false, msg: `Producto ${item.productoId} no encontrado` });
      }
      if (producto.stock < item.cantidad) {
        return res.status(400).json({ ok: false, msg: `Stock insuficiente para ${producto.nombre}` });
      }
    }

    // Construir objeto pedido seguro
    const subtotal = req.body.items.reduce((acc, it) => acc + (Number(it.precio || 0) * Number(it.cantidad || 0)), 0);
    const pedidoData = {
      usuarioId: req.body.usuarioId,
      items: req.body.items.map(it => ({
        productoId: it.productoId,
        nombre: it.nombre,
        cantidad: Number(it.cantidad),
        precio: Number(it.precio)
      })),
      total: subtotal + (entregaTipo === 'domicilio' ? shippingCost : 0),
      direccion: req.body.direccion || '',
      entregaTipo,
      shippingCost: (entregaTipo === 'domicilio') ? shippingCost : 0,
      estado: req.body.estado || 'pendiente',
      motivoAnulacion: req.body.motivoAnulacion || undefined
    };

    // Crear pedido
    const pedido = await Pedido.create(pedidoData);

    // Descontar stock
    for (const item of pedido.items) {
      await Producto.findByIdAndUpdate(
        item.productoId,
        { $inc: { stock: -item.cantidad } }
      );
    }

    // Enviar boleta por correo al cliente
    try {
      const usuario = await Usuario.findById(pedido.usuarioId).select('nombre correo');
      if (usuario && usuario.correo) {
        await enviarBoleta(pedido, usuario, '(Confirmación de compra)');
      }
    } catch (mailErr) {
      console.error('Error enviando boleta al crear pedido:', mailErr);
    }

    res.status(201).json({ ok: true, pedido });
  } catch (err) {
    console.error('Error en POST /api/pedidos:', err);
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Listar todos los pedidos
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

// Obtener un pedido por ID
router.get('/detalle/:id', async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('usuarioId', 'nombre correo')
      .populate('items.productoId', 'nombre precio');

    if (!pedido) {
      return res.status(404).json({ ok: false, msg: 'Pedido no encontrado' });
    }

    res.json({ ok: true, pedido });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Listar pedidos por usuario
router.get('/:usuarioId', async (req, res) => {
  try {
    const pedidos = await Pedido.find({ usuarioId: req.params.usuarioId })
      .populate('items.productoId', 'nombre precio');
    res.json({ ok: true, pedidos });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Actualizar pedido (estado, dirección, etc.)
router.put('/:id', async (req, res) => {
  try {
    // Permitir actualizar datos del pedido
    const update = {};
    if (typeof req.body.estado !== 'undefined') update.estado = req.body.estado;
    if (typeof req.body.direccion !== 'undefined') update.direccion = req.body.direccion;
    if (typeof req.body.entregaTipo !== 'undefined') {
      update.entregaTipo = (req.body.entregaTipo === 'domicilio') ? 'domicilio' : 'presencial';
    }
    if (typeof req.body.shippingCost !== 'undefined') {
      const sc = Number(req.body.shippingCost);
      update.shippingCost = isNaN(sc) || sc < 0 ? 0 : sc;
    }

    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!pedido) {
      return res.status(404).json({ ok: false, msg: 'Pedido no encontrado' });
    }

    // Enviar notificación por correo con boleta actualizada
    try {
      const usuario = await Usuario.findById(pedido.usuarioId).select('nombre correo');
      if (usuario && usuario.correo) {
        await enviarBoleta(pedido, usuario, `(Estado: ${pedido.estado})`);
      }
    } catch (mailErr) {
      console.error('Error enviando correo de actualización de estado:', mailErr);
    }

    res.json({ ok: true, msg: 'Pedido actualizado correctamente', pedido });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Anular pedido
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

    // Notificar anulación al cliente
    try {
      const usuario = await Usuario.findById(pedido.usuarioId).select('nombre correo');
      if (usuario && usuario.correo) {
        await enviarBoleta(pedido, usuario, '(Pedido anulado)');
      }
    } catch (mailErr) {
      console.error('Error enviando correo de anulación:', mailErr);
    }

    res.json({ ok: true, pedido });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Generar orden de despacho (cambia a preparación y descuenta stock)
router.put('/:id/despacho', async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({ ok: false, msg: 'Pedido no encontrado' });
    }

    // Descontar stock de cada producto (si no se descontó antes)
    for (const item of pedido.items) {
      await Producto.findByIdAndUpdate(
        item.productoId,
        { $inc: { stock: -item.cantidad } }
      );
    }

    pedido.estado = 'preparacion';
    await pedido.save();

    // Notificar cambio de estado por correo
    try {
      const usuario = await Usuario.findById(pedido.usuarioId).select('nombre correo');
      if (usuario && usuario.correo) {
        await enviarBoleta(pedido, usuario, '(En preparación)');
      }
    } catch (mailErr) {
      console.error('Error enviando correo al generar despacho:', mailErr);
    }

    res.json({ ok: true, msg: 'Orden de despacho generada y stock actualizado', pedido });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Marcar pedido como entregado
router.put('/:id/entregar', async (req, res) => {
  try {
    const pedido = await Pedido.findByIdAndUpdate(
      req.params.id,
      { estado: 'entregado' },
      { new: true }
    );

    if (!pedido) {
      return res.status(404).json({ ok: false, msg: 'Pedido no encontrado' });
    }

    // Enviar boleta/confirmación al cliente
    try {
      const usuario = await Usuario.findById(pedido.usuarioId).select('nombre correo');
      if (usuario && usuario.correo) {
        await enviarBoleta(pedido, usuario, '(Entregado)');
      }
    } catch (mailErr) {
      console.error('Error enviando correo al marcar entregado:', mailErr);
    }

    res.json({ ok: true, msg: 'Pedido marcado como entregado', pedido });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

// Listar solicitudes de anulación (pedidos con estado "anulado")
router.get('/solicitudes/anulacion', async (req, res) => {
  try {
    const pedidos = await Pedido.find({ estado: 'anulado' })
      .populate('usuarioId', 'nombre correo')
      .populate('items.productoId', 'nombre precio');

    res.json({ ok: true, pedidos });
  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

module.exports = router;