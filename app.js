const http = require('http')

const port = 1000

const server = (req, res) => {
    res.end("I am you Server... jsssss")
}

http.createServer( server ).listen( port )






