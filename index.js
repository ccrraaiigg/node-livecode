var childProcess = require('child_process')
const WebSocket = require('ws')

const wss = new WebSocket.Server({port: 8087})
global.wss = wss

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received a command')
    var command = JSON.parse(message)
    switch (command.verb) {
    case 'require':
      myRequire(ws, command.parameters);
      break
    case 'eval':
      eval(command.parameters.body)
      break
    default: }})})

function myRequire(ws, parameters) {
  ws.send('received require command')
  var loadPackage = childProcess.spawn('npm', ['install', parameters.package])
  loadPackage.on('close', function () {
    eval(parameters.then)})}

