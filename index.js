const childProcess = require('child_process')
const ws = require('ws')
const fs = require('fs')
const httpServ = require('https')
const port = 8087
// Change this if you don't have an certificate (get one for free from Let's Encrypt!)
const ssl = true

if (ssl) {
    const ws_cfg = {
	ssl: true,
	port: port,
	ssl_key: '/etc/letsencrypt/live/frankfurt.demo.blackpagedigital.com/privkey.pem',
	ssl_cert: '/etc/letsencrypt/live/frankfurt.demo.blackpagedigital.com/fullchain.pem'}

    const processRequest = function(req, res) {
	console.log("Request received.")}

    var app = null

    app = httpServ.createServer(
	{
	    key: fs.readFileSync(ws_cfg.ssl_key),
	    cert: fs.readFileSync(ws_cfg.ssl_cert)
	},
	processRequest).listen(ws_cfg.port)

    global.wss = new ws.Server({server: app})}
else 
    global.wss = new ws.Server({port: port})

global.require = require
global.instructions = new Object
global.credential = '7b495b71-ebe3-4428-942e-18827846ce6c'
global.myUndefined = undefined

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
	var command,
	    instruction,
	    parameters

	try {command = JSON.parse(message)}
	catch (e) {
	    myLog(ws, 'rejected malformed command' + message)
	    return}

	instruction = command.instruction
	parameters = command.parameters

	myLog(ws, 'received command \'' + instruction + '\'')

	if (command.credential == credential) {
	    switch (instruction) {
	    case 'require':
		myLog(ws, 'received require for ' + parameters.package)
		var loadPackage = childProcess.spawn('npm', ['install', parameters.package])
		loadPackage.on(
		    'close',
		    function () {
			eval(parameters.then)})
		break
	    case 'add instruction':
		myLog(ws, 'adding instruction \'' + parameters.instructionToAdd + '\'')
		var instruction = eval('(' + parameters.body + ')')
		if (typeof instruction == 'function')
		    instructions[parameters.instructionToAdd] = instruction
		break
	    case 'eval':
		myLog(ws, 'evaluting code')
		eval(parameters.body)
		break
	    case 'modules':
		myLog(ws, 'enumerating modules')
		ws.send(JSON.stringify(Object.keys(require.cache)))
		break
	    default:
		evaluateAddedInstruction(ws, instruction, parameters)}}
	else evaluateAddedInstruction(ws, instruction, parameters)})})

function evaluateAddedInstruction(ws, instruction, parameters) {
    if (typeof instructions[instruction] == "function") {
	myLog(ws, 'evaluating added instruction \'' + instruction + '\'')
	myLog(ws, instructions[instruction].apply(ws, parameters))}
    else
	myLog(ws, 'rejected command \'' + instruction + '\'')}
	      
function myLog(ws, string) {
    var toSend = 'server: ' + string
    ws.send(toSend)
    console.log(toSend)}

