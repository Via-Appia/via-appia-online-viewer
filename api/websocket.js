export const socket = new WebSocket('ws://localhost:8080')
const slug = window.location.href.split('#')[1]
console.log('slug', slug)


// Listen for messages
socket.onmessage = (data) => {
  console.log('🔥 messge at the server', data)
}

socket.onopen = (event) => {

  socket.send(JSON.stringify({ type: 'CONNECT', payload: { id: slug } }))
}

/* 
const slug = window.location.href.split('#')[1]

class Socket extends WebSocket {
  constructor (id) {
    const host = require('os')
      .hostname()
      .toLowerCase()
    const port = 8001
    const url = `ws://${host}:${port}`
    super(url)
    console.log('ID: ', id)
    this.id = id
  }

  // send (obj) {
  //   super.send(JSON.stringify(obj))
  // }

  connect () {
    this.send(JSON.stringify({ type: 'CONNECT', payload: { id: this.id } }))
  }

  // startView(view) {
  //   this.send({ type: "START-VIEW", payload: view });
  // }

  // endView(view) {}
}

export const socket = new Socket(slug)

socket.onopen = (event) => {
  socket.connect()
}
 */

// export default Socket;
