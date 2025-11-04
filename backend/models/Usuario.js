const { Schema, model } = require('mongoose');

const UsuarioSchema = new Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // en producción deberías encriptar
  rol: { type: String, enum: ['admin', 'encargado', 'dueño', 'cliente'], default: 'cliente' },
  telefono: { type: String }
}, { timestamps: true });

module.exports = model('Usuario', UsuarioSchema);