require('dotenv').config()
require('./mongo')

const express = require('express')
const app = express()
const cors = require('cors')
const User = require('./models/User')
const Reserva = require('./models/Reserva')
const notFound = require('./middleware/notFound.js')
const handleErrors = require('./middleware/handleErrors.js')
const userExtractor = require('./middleware/userExtractor.js')
const usersRouter = require('./controllers/Users')
const loginRouter = require('./controllers/login')

app.use(cors())
app.use(express.json())

app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})

app.get('/api/reservas', async (request, response) => {
  const reservas = await Reserva.find({}).populate('user', {
    username: 1,
    name: 1
  })
  response.json(reservas)
})

app.get('/api/reservas/:habitacion', (request, response, next) => {
  const { habitacion } = request.params

  Reserva.find({ habitacion }).then(reserva => {
    if (reserva) {
      response.json(reserva)
    } else {
      response.status(404).end()
    }
  }).catch(err => next(err))
})

app.put('/api/reservas/:id', userExtractor, (request, response, next) => {
  const { id } = request.params
  const reserva = request.body

  const newReservaInfo = {
    nombre: reserva.nombre
  }

  Reserva.findOneAndUpdate(id, newReservaInfo, { new: true })
    .then(result => {
      response.json(result)
    })
    .catch(next)
})

app.delete('/api/reservas/:id', userExtractor, async (request, response, next) => {
  const { id } = request.params

  const res = await Reserva.findOneAndRemove({ id })
  if (res === null) return response.sendStatus(404)

  Reserva.findOneAndRemove({ id }).then(() => {
    response.status(204).end()
  }).catch(error => next(error))

  response.status(204).end()
})

app.post('/api/reservas', userExtractor, async (request, response, next) => {
  const {
    pasajeros,
    nombre,
    fechaEntrada,
    fechaSalida,
    habitacion,
    precio
  } = request.body

  const { userId } = request

  const user = await User.findById(userId)

  const newReserva = new Reserva({
    pasajeros,
    nombre,
    fechaEntrada,
    fechaSalida,
    habitacion,
    precio
  })

  try {
    const savedReserva = await newReserva.save()

    user.reservas = user.reservas.concat(savedReserva._id)
    await user.save()
    response.json(savedReserva)
  } catch (error) {
    next(error)
  }
})

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(notFound)
app.use(handleErrors)

const PORT = process.env.PORT
const server = app.listen(PORT, () => {
  console.log('server connected')
})

module.exports = { app, server }
