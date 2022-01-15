export const socket = new WebSocket('ws://localhost:8080')

// Listen for messages
socket.onmessage = (data) => {
  console.log('🔥 messge at the server', data)
}
