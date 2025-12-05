const { Schema, model } = require('mongoose');
// Esquema para el producto (flores o arreglos florales)
const ProductoSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'El stock no puede ser negativo']
  },
  imagen: {
    type: String,
    default: ''
  },

  temporada: {
    type: String,
    required: [true, 'La temporada es obligatoria'],
    enum: ['primavera', 'verano', 'otoño', 'invierno'],
    trim: true
  }

}, {
  timestamps: true
});

module.exports = model('Producto', ProductoSchema);