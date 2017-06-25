var childProcess = require('child_process')
const WebSocket = require('ws')
var fs = require('fs')

var ws_cfg = {
    ssl: true,
    port: 8087,
    ssl_key: '',
    ssl_cert: ''
};

var processRequest = function(req, res) {
    console.log("Request received.")
};

var httpServ = require('https');
var app = null;

app = httpServ.createServer({
    key: fs.readFileSync(ws_cfg.ssl_key),
    cert: fs.readFileSync(ws_cfg.ssl_cert)
}, processRequest).listen(ws_cfg.port);

var wss = new WebSocket.Server( {server: app});

// const wss = new WebSocket.Server({port: 8087})
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

