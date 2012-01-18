var Stream = require('stream').Stream;

/**
 * Creates an in/out pipe. Write stuff and 'data' will be emitted.
 */
module.exports = function() {
	
	var api = new Stream();

	var paused = false;

	// -- writable stream

	api.writable = true;

	api.write = function(data, encoding) {
		if (!paused) return api.emit('data', data, encoding);
		return true;
	};
	
	api.end = function(data, encoding) { 
		if (data) api.write(data, encoding);
		api.writable = false;
		api.emit('end');
		return true;
	};
	
	api.destroy = function() { 
		api.writable = false; 
		return true;
	};

	api.destroySoon = function() {
		return true;
	};

	// -- readable stream

	api.readable = true;

	api.setEncoding = function(encoding) { };

	api.pause = function() {
		return paused = true;
	};

	api.resume = function() {
		return paused = false;
	};

	return api;
};