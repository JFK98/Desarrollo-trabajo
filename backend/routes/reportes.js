const { Router } = require('express');
const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const router = Router();

<<<<<<< HEAD
//Ventas totales y cantidad de pedidos
router.get('/ventas', async (req, res) => {
  try {
    const pedidos = await Pedido.find();

    const total = pedidos.reduce((acc, p) => acc + p.total, 0);
    const cantidad = pedidos.length;

    res.json({
      ok: true,
      total,
      pedidos: cantidad
    });

  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

//Ruta para inventario general
router.get('/inventario', async (req, res) => {
  try {
    const productos = await Producto.find();

    const stockBajo = productos.filter(p => p.stock <= 5).length;

    res.json({
      ok: true,
      stockBajo
    });

  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

//Ruta original para reportes por periodo
=======
>>>>>>> da512b33258ccefbb4c80cf47f4cb85c823a05ca
router.get('/', async (req, res) => {
  try {
    const { tipo } = req.query;

    let groupFormat;
    if (tipo === 'diario') groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    else if (tipo === 'mensual') groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    else groupFormat = { $dateToString: { format: "%Y", date: "$createdAt" } };

    const reporte = await Pedido.aggregate([
      {
        $group: {
          _id: groupFormat,
          ventas: { $sum: "$total" },
          pedidos: { $sum: 1 },
          promedio: { $avg: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ ok: true, reporte });

  } catch (err) {
    res.status(500).json({ ok: false, msg: err.message });
  }
});

module.exports = router;
