// ...existing code...
const { Schema, model, Types } = require('mongoose');

// Esquema para el pedido
const PedidoSchema = new Schema({
 
  usuarioId: { 
    type: Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  // Productos en el pedido
  items: [
    {
      productoId: { type: Types.ObjectId, ref: 'Producto' }, 
      nombre: { type: String, required: true },              
      cantidad: { type: Number, required: true },            
      precio: { type: Number, required: true }               
    }
  ],

  // Total del pedido
  total: { 
    type: Number, 
    required: true 
  },

  // Estado del pedido
  estado: { 
    type: String, 
    enum: ['pendiente', 'confirmado', 'preparacion', 'entregado', 'anulado'], 
    default: 'pendiente' 
  },

  // Dirección de entrega
  direccion: { 
    type: String, 
    required: true 
  },

  // Motivo de anulación
  motivoAnulacion: { 
    type: String 
  },

  // Nuevo: tipo de entrega (presencial o domicilio)
  entregaTipo: {
    type: String,
    enum: ['presencial', 'domicilio'],
    default: 'presencial'
  },

  // Nuevo: costo de envío en pesos (si aplica)
  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  }

}, { 
  timestamps: true 
});


module.exports = model('Pedido', PedidoSchema);
// ...existing code...