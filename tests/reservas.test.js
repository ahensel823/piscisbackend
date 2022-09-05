const moongose = require('mongoose')
const { server } = require('../index')
const Reserva = require('../models/Reserva')
const {
  api,
  initialReservas,
  getAllContentFromReservas
} = require('./helpers')

beforeEach(async () => {
  await Reserva.deleteMany({})

  const reserva1 = new Reserva(initialReservas[0])
  await reserva1.save()

  const reserva2 = new Reserva(initialReservas[1])
  await reserva2.save()
})

test('reservas are returned as json', async () => {
  await api
    .get('/api/reservas')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two reservas', async () => {
  const response = await api.get('/api/reservas')
  expect(response.body).toHaveLength(initialReservas.length)
})

test('the first Reserva', async () => {
  const response = await api.get('/api/reservas')

  const tipos = response.body.map(reserva => reserva.Tipo)

  expect(tipos).toContain('C2')
})

test('a valid reserva can be added', async () => {
  const newReserva = {
    Tipo: 'C1'
  }

  await api
    .post('/api/reservas')
    .send(newReserva)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const tipos = getAllContentFromReservas()
  const response = getAllContentFromReservas()

  expect(response.body).toHaveLength(initialReservas.length + 1)
  expect(tipos).toContain(newReserva.Tipo)
})

test('reserva without content is not added', async () => {
  const newReserva = {
    Fecha: new Date()
  }

  await api
    .post('/api/reservas')
    .send(newReserva)
    .expect(400)

  const response = await api.get('/api/reservas')

  expect(response.body).toHaveLength(initialReservas.length)
})

test('a reserva can be deleted', async () => {
  const { response: firstResponse } = await getAllContentFromReservas()
  const { body: reservas } = firstResponse
  const reservaToDelete = reservas[0]

  await api
    .delete(`/api/reservas/${reservaToDelete.Tipo}`)
    .expect(204)

  const { tipos, response: secondResponse } = await getAllContentFromReservas()

  expect(secondResponse.body).toHaveLength(initialReservas.length - 1)

  expect(tipos).not.toContain(reservaToDelete.Tipo)
})

test('a reserva that has an invalid type can not be deleted', async () => {
  await api
    .delete('/api/reservas/C22')
    .expect(400)

  const { response } = await getAllContentFromReservas()

  expect(response.body).toHaveLength(initialReservas.length)
})

test('a reserva that has a valid type but do not exist can not be deleted', async () => {
  const validObjectTypeThatDoNotExist = 'C3'
  await api
    .delete(`/api/reservas/${validObjectTypeThatDoNotExist}`)
    .expect(404)

  const { response } = await getAllContentFromReservas()

  expect(response.body).toHaveLength(initialReservas.length)
})
afterAll(() => {
  moongose.connection.close()
  server.close()
})
