const path = require('path')
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'static')))

class Msg {
    constructor(from, to, text) {
        this.to = to
        this.from = from
        this.text = text
    }
}

let chatters = []

io.on('connection', (socket) => {    
    let chatterName = null

    socket.emit('chatters', chatters)
    socket.on('msg', msg => {
        console.log(msg)
        io.emit('msg', msg)
    })

    socket.on('login request', (username) => {
        if (chatters.indexOf(username) == -1) {
            chatterName = username
            chatters.push(username)
            console.log(chatters)
            socket.emit('login granted', username)
            io.emit('new chatter', username)
        } else {
            socket.emit('login denied', username)
        }
    })

    socket.on('disconnect', () => {
        if (chatterName) {
            const index = chatters.indexOf(chatterName)
            chatters.splice(index, 1)
            io.emit('chatter down', chatterName)
        }
        console.log(chatters)
    })
});



server.listen(3000, () => {
    console.log('listening on *:3000');
});