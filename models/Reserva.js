const { Schema, model } = require('mongoose')

const reservaSchema = new Schema({
  pasajeros: String,
  nombre: String,
  fechaEntrada: String,
  fechaSalida: String,
  habitacion: String,
  precio: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

reservaSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Reserva = model('Reserva', reservaSchema)
module.exports = Reserva
