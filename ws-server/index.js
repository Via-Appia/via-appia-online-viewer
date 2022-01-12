const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', (ws) => {
  ws.on('message', (data, isBinary) => {
    //
    // Broadcast to every client
    //
    wss.clients.forEach(function each (client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary })
      }
    })
  })
})
