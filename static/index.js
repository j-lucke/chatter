const socket = io()

class Msg {
    constructor(from, to, text) {
        this.to = to
        this.from = from
        this.text = text
    }
}

let username = null;

const form = document.getElementById('form')
const input = document.getElementById('input')
const messages = document.getElementById('messages')
const login = document.getElementById('login')
const form_login = document.getElementById('form-login')
const input_login = document.getElementById('input-login')
const list_link = document.getElementById('list-link')
const list_container = document.getElementById('list-container')
const list = document.getElementById('list')


form.addEventListener('submit', function(e) {
    e.preventDefault()
    if (input.value) {
        socket.emit('msg', new Msg(username, 'all', input.value))
        input.value = ''
    }
});

login.addEventListener('click', f = function() {
    login.style.display = 'none'
    form_login.style.display = 'flex'
})

list_link.addEventListener('click', () => {
    console.log('click ' + list_container.style.display)
    if (!list_container.style.display)
        console.log('!')
    if (list_container.style.display == 'none') {
        list_container.style.display = 'flex'
        list_link.innerText = 'hide chatters'
    } else {
        list_container.style.display = 'none'
        list_link.innerText = 'show chatters'
    }
})

form_login.addEventListener('submit', (e) => {
    e.preventDefault()
    if (input_login.value) {
        socket.emit('login request', input_login.value)
        input_login.value=''
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
    chatters.forEach(chatter => {
        const temp = document.createElement('li')
        temp.innerText = chatter
        temp.setAttribute('id', chatter)
        list.appendChild(temp)
    })
})

socket.on('new chatter', chatter => {
    const temp = document.createElement('li')
    temp.innerText = chatter
    temp.setAttribute('id', chatter)
    list.appendChild(temp)
})

socket.on('chatter down', chatter => {
    const temp = document.getElementById(chatter)
    temp.remove()
})

socket.on('msg', msg => {
    const item = document.createElement('li')
    item.textContent = `${msg.from}: ${msg.text}`
    messages.appendChild(item)
    window.scrollTo(0, document.body.scrollHeight)
})