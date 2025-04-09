const express = require('express')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
app.use(bodyParser.json())
app.use(cors())
const users = []
const secretKey = 'your_secret_key'
app.post('/register', (req, res) => {
  const { username, password } = req.body
  if (users.some(u => u.username === username)) {
    return res.status(400).json({ error: 'Пользователь уже существует' })
  }
  users.push({ username, password })
  res.json({ message: 'Пользователь зарегистрирован' })
})
app.post('/login', (req, res) => {
  const { username, password } = req.body
  const user = users.find(u => u.username === username && u.password === password)
  if (!user) {
    return res.status(401).json({ error: 'Неверные данные' })
  }
  const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' })
  res.json({ token })
})
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Токен не предоставлен' })
  const token = authHeader.split(' ')[1]
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Неверный токен' })
    req.user = decoded
    next()
  })
}
app.get('/protected', verifyToken, (req, res) => {
  res.json({ data: 'Это защищённые данные.' })
})
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('Сервер запущен на порту', PORT)
})
