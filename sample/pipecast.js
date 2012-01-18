var pipecast = require('..');
var http = require('http');

var pipe = pipecast({ logger: console });

http.createServer(function(req, res) {
	if (req.url === "/pipe") {
		return pipe(req, res);
	}

	res.write("GET /pipe: Start a downstream\n");
	res.write("POST /pipe: Send message into all downstreams\n");
	res.end();
}).listen(5000);

console.log('Listening on 5000');