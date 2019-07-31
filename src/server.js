const express = require('express')
const http = require('http')
const serverio = require('socket.io')
const app = express()
const server = http.createServer(app)
const serverSocket = serverio(server)

app.get('/', (req, res) => {
    res.send('live')
})

module.exports = { 'serverSocket': serverSocket, 'server': server }