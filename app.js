const express = require('express')
const app = express()
const path = require('path')
const http = require('http')
const socketio = require('socket.io')

const server = http.createServer(app)

const io = socketio(server)

app.set('view engine', "ejs")
app.use(express.static(path.join(__dirname, 'public')));
io.on("connection", function (socket) {
    socket.on("send-location", function (data) {
        io.emit("received-location", { id: socket.id, ...data })
    })
    console.log("connected")
    socket.on("disconnect", function () {
        io.emit('user-disconnect', socket.id)
    })
    socket.on("chat-message", (data) => {
    io.emit("chat-message", data)
})
})
app.get('/', function (req, res) {
    res.render('index')
})

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
