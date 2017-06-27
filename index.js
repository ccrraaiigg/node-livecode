var childProcess = require('child_process')
const WebSocket = require('ws')
var fs = require('fs')

var ws_cfg = {
    ssl: true,
    port: 8087,
    ssl_key: '/etc/letsencrypt/live/yoursite/privkey.pem',
    ssl_cert: '/etc/letsencrypt/live/yoursite/fullchain.pem'}

var processRequest = function(req, res) {
    console.log("Request received.")}

var httpServ = require('https')
var app = null

app = httpServ.createServer({
    key: fs.readFileSync(ws_cfg.ssl_key),
    cert: fs.readFileSync(ws_cfg.ssl_cert)
}, processRequest).listen(ws_cfg.port)

var wss = new WebSocket.Server( {server: app})
global.wss = wss
global.instructions = new Object
global.myUndefined = undefined

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
	var command = JSON.parse(message),
	    verb = command.verb,
	    parameters = command.parameters

	myLog(ws, 'received command \'' + verb + '\'')

	if (command.credential == 'shared secret') {
	    switch (verb) {
	    case 'require':
		myLog(ws, 'received require for ' + parameters.package)
		var loadPackage = childProcess.spawn('npm', ['install', parameters.package])
		loadPackage.on(
		    'close',
		    function () {
			eval(parameters.then)})
		break
	    case 'add instruction':
		myLog(ws, 'adding instruction \'' + parameters.verbToAdd + '\'')
		var instruction = eval('(' + parameters.body + ')')
		if (typeof instruction == 'function')
		    instructions[parameters.verbToAdd] = instruction
		break
	    case 'eval':
		myLog(ws, 'evaluting code')
		eval(parameters.body)
		break
	    default: }}
	else {
	    if (typeof instructions[verb] == "function") {
		myLog(ws, 'evaluating added instruction \'' + verb + '\'')
		myLog(ws, instructions[verb].apply(ws, parameters.parameters))}
	    else
		myLog(ws, 'rejected command \'' + verb + '\'')}})})

function myLog(ws, string) {
    var toSend = 'server: ' + string
    console.log(toSend)
    ws.send(toSend)}

