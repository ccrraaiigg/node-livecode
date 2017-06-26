var childProcess = require('child_process')
const WebSocket = require('ws')
var fs = require('fs')

var ws_cfg = {
    ssl: true,
    port: 8087,
    ssl_key: '/etc/letsencrypt/live/frankfurt.demo.blackpagedigital.com/privkey.pem',
    ssl_cert: '/etc/letsencrypt/live/frankfurt.demo.blackpagedigital.com/fullchain.pem'
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
global.wss = wss
global.instructions = new Object
global.myUndefined = undefined

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
	myLog(ws, 'received a command')
	var command = JSON.parse(message),
	    verb = command.verb,
	    parameters = command.parameters
	
	if (command.credential == '0b97baf7-0fca-4cb3-add5-36a714a6ab1c') {
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
		instructions[parameters.verbToAdd] = new Function(parameters.body)
		break
	    case 'eval':
		myLog(ws, 'evaluting code')
		eval(parameters.body)
		break
	    default: }}
	else {
	    if (typeof instructions[verb] == "function") {
		myLog(ws, 'evaluating added instruction \'' + verb + '\'')
		ws.send(instructions[verb].call())}
	    else myLog(ws, 'rejected command')}})})

function myLog(ws, string) {
    var toSend = 'server: ' + string
    console.log(toSend)
    ws.send(toSend)}

