const { Schema, model } = require('mongoose');

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
  categoria: {
    type: String,
    default: 'General',
    trim: true
  },
  imagen: {
    type: String,
    default: '' // aquí puedes guardar la URL o ruta de la imagen
  }
}, { 
  timestamps: true // agrega createdAt y updatedAt automáticamente
});

// Exportar el modelo
module.exports = model('Producto', ProductoSchema);