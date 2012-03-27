# pipecast [![Build Status](https://secure.travis-ci.org/anodejs/node-pipecast.png)](http://travis-ci.org/anodejs/node-pipecast)

```bash
$ npm install pipecast
```

The following example starts an http pipe on http://localhost:5000/pipe.
POST requests body will be sent as downstream to all open GET requests.

```js
var pipecast = require('pipecast');
var http = require('http');

// create an http pipe - everything POSTed will be broadcasted
// to all GETters.
var pipe = pipecast();

// serve the pipe through '/pipe'
http.createServer(function(req, res) {
	if (req.url === "/pipe") {
		return pipe(req, res);
	}

	res.write("GET /pipe: Start a downstream\n");
	res.write("POST /pipe: Send message into all downstreams\n");
	res.end();
}).listen(5000);
console.log('Listening on 5000');
```

 > Note that by default, __pipecast__ will add a newline after each `data` chunk.
 > If you wish not to alter the data at all, set `options.map` to 
   `function(d) { return d; }`

Start the server:

```bash
$ node pipecast.js &
[1] 20992
Listening on 5000
```

Fire up a few listeners:

```bash
$ curl http://localhost:5000/pipe &
[2] 20996
$ curl http://localhost:5000/pipe &
[3] 20997
$ curl http://localhost:5000/pipe &
[4] 20998
```

Now start writing:

```bash
$ curl http://localhost:5000/pipe -d "Hello 1"
Hello 1
Hello 1
Hello 1
$ curl http://localhost:5000/pipe -d "Hello 2"
Hello 2
Hello 2
Hello 2
```

## API

### pipecast([options]) ###

Returns `function(req, res)` which is an HTTP handler that can be used with the `http`
module, `express`, `connect` and whatnot.

`options.headers` are headers to reply with for GET requests. Default 
is { 'content-type': 'text/plain' }

`options.logger` alternative logger (must conform to `console`). Default is `null`, 
in which case no logs will be emitted.

`options.map` is an optional `function(data) => data` that maps incoming data to outgoing data and can be used to transform upstream content. One common usage of this
is to add a newline after each data chunk so that buffers will flush to downstream
consumers. Default is to add a newline at the end of `data`.

### pipecast.pipe() ###

Returns an object that conforms to node.js `StreamReader` and `StreamWriter` and pipes
data from `write()` operations to `data` events.

## LICENSE

MIT