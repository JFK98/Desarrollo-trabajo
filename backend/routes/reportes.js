const { Router } = require('express');
const Pedido = require('../models/Pedido');
const router = Router();

router.get('/', async (req, res) => {
  try {
    const { tipo } = req.query;

    // Agrupación según tipo
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
