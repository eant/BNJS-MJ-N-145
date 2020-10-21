const http = require("http")
const fs = require('fs')

const port = 1000   //mas allá del 1000 usualmente están disponibles

const server = (req, res) => {  //parametros para configurar el servidor

    fs.readFile('front/index.html', (error, content) => {

        if(error){
            res.writeHead(404, { "Content-Type" : "text/plain" })
            res.end(`Malió sal...`)
        } else {
            res.writeHead(200, { "Content-Type" : "text/html" })
            res.end(content)
        }

    })
}

http.createServer( server ).listen( port ) //configuro las propiedades del servidor