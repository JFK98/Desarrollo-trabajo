const { Schema, model, Types } = require('mongoose');

const CarritoSchema = new Schema({
  usuarioId: { type: Types.ObjectId, ref: 'Usuario', unique: true, required: true },
  items: [
    {
      productoId: { type: Types.ObjectId, ref: 'Producto', required: true },
      nombre: { type: String, required: true },
      precio: { type: Number, required: true },
      cantidad: { type: Number, required: true, min: 1 }
    }
  ]
}, { timestamps: true });

module.exports = model('Carrito', CarritoSchema);