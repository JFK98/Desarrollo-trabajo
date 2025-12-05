const nodemailer = require('nodemailer');
// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Generar HTML de la boleta
function generarBoletaHtml(pedido, usuario) {
  const itemsHtml = (pedido.items || []).map(i =>
    `<tr>
      <td>${i.nombre}</td>
      <td style="text-align:center">${i.cantidad}</td>
      <td style="text-align:right">$${(i.precio ?? 0).toLocaleString()}</td>
      <td style="text-align:right">$${(((i.precio ?? 0) * (i.cantidad ?? 1)) ?? 0).toLocaleString()}</td>
    </tr>`
  ).join('');

  const total = pedido.total ?? 0;
  const fecha = pedido.createdAt ? new Date(pedido.createdAt).toLocaleString() : new Date().toLocaleString();
  const estado = pedido.estado ?? 'pendiente';

  //Mostrar tipo de entrega y costo de envío
  const entregaTipo = pedido.entregaTipo === 'domicilio' ? 'Envío a domicilio' : 'Retiro / Entrega presencial';
  const shippingCost = Number(pedido.shippingCost) || 0;
  const shippingHtml = shippingCost > 0 ? `<p><strong>Costo envío:</strong> $${shippingCost.toLocaleString()}</p>` : `<p><strong>Costo envío:</strong> $0</p>`;

  return `
    <div style="font-family:Arial,Helvetica,sans-serif; color:#222;">
      <h2>Boleta de Pedido - Flor & Vida</h2>
      <p><strong>ID:</strong> ${pedido._id ?? '-'}</p>
      <p><strong>Cliente:</strong> ${usuario?.nombre ?? usuario?.correo ?? '-'}</p>
      <p><strong>Correo:</strong> ${usuario?.correo ?? '-'}</p>
      <p><strong>Fecha:</strong> ${fecha}</p>
      <p><strong>Dirección:</strong> ${pedido.direccion ?? '-'}</p>
      <p><strong>Tipo de entrega:</strong> ${entregaTipo}</p>
      ${shippingHtml}
      <p><strong>Estado del pedido:</strong> ${estado}</p>
      <table width="100%" border="0" cellpadding="6" cellspacing="0" style="border-collapse:collapse; margin-top:10px;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th align="left">Producto</th>
            <th align="center">Cant.</th>
            <th align="right">Precio</th>
            <th align="right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="text-align:right"><strong>Total:</strong></td>
            <td style="text-align:right"><strong>$${total.toLocaleString()}</strong></td>
          </tr>
        </tfoot>
      </table>
      <p style="margin-top:18px;">Gracias por su compra.</p>
    </div>
  `;
}

// Enviar boleta por correo del usuario que realizo el pedido
async function enviarBoleta(pedido, usuario, asuntoExtra = '') {
  try {
    const html = generarBoletaHtml(pedido, usuario);
    const mailOptions = {
      from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
      to: usuario?.correo,
      subject: `Boleta de pedido ${pedido._id ?? ''} ${asuntoExtra}`.trim(),
      html
    };
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    console.error('Error enviando correo:', err);
    throw err;
  }
}

module.exports = { enviarBoleta, generarBoletaHtml, transporter };
