const { Schema, model, Types } = require('mongoose');

/**
 * Esquema de Pedido
 * Representa una orden de compra realizada por un usuario
 */
const PedidoSchema = new Schema({
  // Usuario que realizó el pedido
  usuarioId: { 
    type: Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },

  // Lista de productos incluidos en el pedido
  items: [
    {
      productoId: { type: Types.ObjectId, ref: 'Producto' }, // referencia al producto
      nombre: { type: String, required: true },              // nombre del producto
      cantidad: { type: Number, required: true },            // cantidad comprada
      precio: { type: Number, required: true }               // precio unitario
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

  // Motivo de anulación (si aplica)
  motivoAnulacion: { 
    type: String 
  }

}, { 
  timestamps: true // agrega createdAt y updatedAt automáticamente
});

// Exportar el modelo
module.exports = model('Pedido', PedidoSchema);