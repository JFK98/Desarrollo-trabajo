const { Schema, model } = require('mongoose');
// Esquema para el usuario
const UsuarioSchema = new Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  password: { type: String, required: true }, 
  rol: { type: String, enum: ['admin', 'encargado', 'dueño', 'cliente'], default: 'cliente' },
  telefono: { type: String },
  direccion: { type: String }
}, { timestamps: true });

module.exports = model('Usuario', UsuarioSchema);
