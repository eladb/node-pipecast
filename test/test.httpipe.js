var http = require('http');
var httpipe = require('..');
var testcase = require('nodeunit').testCase;
var logule = require('logule').suppress('trace');
var ctxcon = require('ctxobj').console;
var async = require('async');
var logger = ctxcon(logule);


exports.test = testcase({
	setUp: function(cb) {
		this.server = http.createServer(httpipe({ logger: logger.pushctx('server'), silent: false, newline: false }));
		this.server.port = 7866;
		return this.server.listen(this.server.port, cb);
	},

	tearDown: function(cb) {
		console.log('closing server');
		this.server.close();
		return cb();
	},

	t: function(test) {
		var self = this;
		var dscount = 10;
		var uscount = 5;
		var items = left = 34;

		// create `uscount` upstreams and start writing items until no more
		// items are left to write.
		async.forEach(range(uscount), function(i, cb) {
			var us = http.request({ port: self.server.port, method: 'POST', agent: null });
			var interval = Math.round(Math.random() * 500);

			var timer = setInterval(function() {
				if (left === 0) {
					us.end();
					clearInterval(timer);
					return cb();
				}

				logger.log(left + "/" + items, 'written');
				us.write('item#' + left.toString() + "\n");
				left--;

			}, interval);

		}, function() { });

		async.forEach(range(dscount), function(i, cb) {
			var backoff = Math.round(Math.random() * 500);
			setTimeout(function() {
				var ds = http.request({ port: self.server.port, method: 'GET', agent: null });
				
				ds.q = [];
				ds.on('response', function(res) {
					ds.expected = left;
					res.on('data', function(data) {
						ds.q.push(data);
						if (ds.q.length === ds.expected) {
							ds.abort();
							cb();
						}
					});
				});

				ds.end();

			}, backoff);
		}, function() { test.done(); });
	},
});

// -- utils

function range(size) {
	var arr = [];
	for (var i = 0; i < size; ++i) arr.push(i);
	return arr;
}
