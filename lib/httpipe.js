var http = require('http');
var pipe = require('./pipe');
var ctxcon = require('ctxobj').console;

/**
 * Returns an http handler that pipe POST data to long-polling GET clients.
 */
module.exports = function(options) {
	options = options || {};
	var headers = options.headers || { 'content-type': 'text/plain' };
	var logger = options.logger || console;
	var silent = !options.logger;
	var map = options.map || function(data) { return data.toString() + "\n"; };

	// wrap logger with ctxcon
	logger = ctxcon(logger);
	
	// this pipe will be used to broadcast data to all connections
	var p = pipe();
	var downstreams = 0;
	var upstreams = 0;

	// return an http handler
	// GET requests will initiate a downstream that never ends.
	// POST requests will write into the pipe.
	return function(req, res) {

		if (req.method === "GET") {
			var dslogger = logger.pushctx('ds#' + downstreams);
			downstreams++;
			if (!silent) dslogger.info('downstream client connected');
			res.writeHead(203, headers);

			res.on('close', function() { 
				if (!silent) dslogger.info('downstream closed');
				downstreams--; 
			});
			return p.on('data', function(data) { 
				if (!silent) dslogger.log(">>" + data.length + " bytes");
				res.write(data); 
				return true;
			});
		}

		if (req.method === "POST") {
			var uslogger = logger.pushctx("us#" + upstreams);
			upstreams++;
			if (!silent) uslogger.info('upstream client connected');
			res.writeHead(200);
			req.on('data', function(data) { 
				if (!silent) uslogger.log("<<" + data.length + " bytes");
				return p.write(map(data));
			});
			req.on('end', function() { 
				upstreams--;
				if (!silent) uslogger.info("upstream closed");
				return res.end(); 
			});
			return true;
		}

		res.writeHead(400, { 'content-type': 'text/plain '});
		return res.end('400 Bad Request\n');
	};
}