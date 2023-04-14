const socket = io()

class Msg {
    constructor(from, to, text) {
        this.to = to
        this.from = from
        this.text = text
    }
}

let username = null;
let target = 'all'

const body = document.querySelector('body')
const form = document.getElementById('form')
const input = document.getElementById('input')
const messages = document.getElementById('messages-all')
const login = document.getElementById('login')
const form_login = document.getElementById('form-login')
const input_login = document.getElementById('input-login')
const list_link = document.getElementById('list-link')
const list_container = document.getElementById('list-container')
const list = document.getElementById('list')
const send = document.getElementById('send')

function createBoard(suffix) {
    const messageBoard = document.createElement('ul')
    messageBoard.setAttribute('id', 'messages-' + suffix)
    messageBoard.setAttribute('class', 'message-board')
    messageBoard.style.display = 'none'
    return messageBoard
}

function abort() {
    alert('target chatter disconected!')
    target = 'all'
    list_link.innerText = target
    form.style.backgroundColor = 'rgba(0,0,0,.15)'
    send.innerText = 'Send'
    send.style.backgroundColor = '#333'

}

form.addEventListener('submit', function(e) {
    e.preventDefault()
    if (input.value) {
        socket.emit('msg', new Msg(username, target, input.value))
    }
    if (target != 'all') {
        const messageBoard = document.getElementById('messages-' + target)
        const item = document.createElement('li')
        item.textContent = `${username}: ${input.value}`
        messageBoard.appendChild(item)
        window.scrollTo(0, document.body.scrollHeight)
    }
    input.value = ''
});

login.addEventListener('click', f = function() {
    login.style.display = 'none'
    form_login.style.display = 'flex'
})

list_link.addEventListener('click', () => {
    if (list_container.style.display == 'none') {
        list_container.style.display = 'flex'
    } else {
        list_container.style.display = 'none'
    }
})

form_login.addEventListener('submit', (e) => {
    e.preventDefault()
    if (input_login.value) {
        socket.emit('login request', input_login.value)
        input_login.value=''
    }
})

list.addEventListener('click', e => {
    const currentMessageBoard = document.getElementById('messages-' + target)
    currentMessageBoard.style.display = 'none'
    target = e.target.id
    list_link.innerText = target
    list_container.style.display = 'none'
    let messageBoard = document.getElementById('messages-' + target)
    if (!messageBoard) {
        messageBoard = createBoard(target)
        body.appendChild(messageBoard)
    }
    messageBoard.style.display = 'block'
    messageBoard.unread = 'false'
    if (target == 'all') {
        form.style.backgroundColor = 'rgba(0,0,0,.15)'
        send.innerText = 'Send'
        send.style.backgroundColor = '#333'
    } else {
        form.style.backgroundColor = 'yellow'
        send.innerText = 'DM'
        send.style.backgroundColor = 'red'
        list_link.style.color = 'black'
        list_link.style.backgroundColor = 'yellow'
        e.target.style.color = 'black'
    }
})

socket.on('login granted', (requestedName) => {
    username = requestedName
    login.innerText = 'chatting as ' + requestedName
    login.removeEventListener('click', f, false)
    form_login.style.display = 'none'
    login.style.display = 'block'
})

socket.on('login denied', (requestedName) => {
    input_login.setAttribute('placeholder', `${requestedName} is unavailable`)
})

socket.on('chatters', chatters => {
    const all = document.createElement('li')
    all.innerText = 'all'
    all.setAttribute('id', 'all')
    list.appendChild(all)
    chatters.forEach(chatter => {
        const temp = document.createElement('li')
        temp.innerText = chatter
        temp.setAttribute('id', chatter)
        list.appendChild(temp)
    })
})

socket.on('new chatter', chatter => {
    if (username == chatter)
        return
    const temp = document.createElement('li')
    temp.innerText = chatter
    temp.setAttribute('id', chatter)
    list.appendChild(temp)
})

socket.on('chatter down', chatter => {
    const temp = document.getElementById(chatter)
    temp.remove()
    const deadBoard = document.getElementById('messages-' + chatter)
    deadBoard.remove()
    if (target == chatter) {
        abort()
    }
})

socket.on('msg', msg => {
    if (msg.to == 'all') {
        const item = document.createElement('li')
        item.textContent = `${msg.from}: ${msg.text}`
        messages.appendChild(item)
        window.scrollTo(0, document.body.scrollHeight)
        return
    }
    if (msg.to != username)
        return

    if (target != msg.from) {
        list_link.style.color = 'white'
        list_link.style.backgroundColor = 'red'
        const tempLink = document.getElementById(msg.from)
        tempLink.style.color = 'red'
    }
    const item = document.createElement('li')
    item.textContent = `${msg.from}: ${msg.text}`
    let messageBoard = document.getElementById('messages-' + msg.from)
    if (!messageBoard) {
        messageBoard = createBoard(msg.from)
        body.appendChild(messageBoard)
    }
    messageBoard.appendChild(item)
    window.scrollTo(0, document.body.scrollHeight)
})