const { app } = require('../index')
const supertest = require('supertest')
const User = require('../models/User')

const api = supertest(app)

const initialReservas = [
  {
    Nombre: 'Carlos Baigorria',
    Pasajeros: 4,
    Tipo: 'C2',
    Fecha: '',
    Dias: 5,
    Precio: '$12000'
  },
  {
    Nombre: 'Alberto Mejunge',
    Pasajeros: 2,
    Tipo: 'D3b',
    Fecha: '',
    Dias: 2,
    Precio: '$8000'
  }
]

const getAllContentFromReservas = async () => {
  const response = await api.get('/api/reservas')
  return {
    tipos: response.body.map(reserva => reserva.Tipo),
    response
  }
}

const getUsers = async () => {
  const usersDB = await User.find({})
  return usersDB.map(user => user.toJSON())
}

module.exports = {
  api,
  initialReservas,
  getAllContentFromReservas,
  getUsers
}
