const express = require('express')
const http = require('http')
const serverio = require('socket.io')
const app = express()
const server = http.createServer(app)
const serverSocket = serverio(server)

module.exports = { 'serverSocket': serverSocket, 'server': server }