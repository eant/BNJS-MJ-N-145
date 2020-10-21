const http = require("http")

const port = 1000   //mas allá del 1000 usualmente están disponibles

const server = (req, res) => {  //parametros para configurar el servidor
    res.end("<h1>Script!!!</h1>")
}

http.createServer( server ).listen( port ) //configuro las propiedades del servidor