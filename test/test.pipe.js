var Stream = require('stream').Stream;
var pipe = require('..').pipe;

exports.test = function(test) {
	var p = pipe();
	var q = [];

	p.on('data', function(data) {
		q.push(data);
	});

	p.write('hello world');
	p.write('yoyoyo');
	p.pause();
	p.write('when paused');
	p.resume();
	p.write('hey');

	test.deepEqual(q, [ 'hello world', 'yoyoyo', 'hey' ]);
	test.done();
};

