const express = require("express")
const app = express()

const port = 1000   //mas allá del 1000 usualmente están disponibles

app.listen(port)
/*
// Plantilla modelo para "endpoints" de express() //
app.TIPO_HTTP("/RUTA", (req, res) => {

})
*/
app.get("/contacto", (req, res) => {
    res.end('Desde acá vamos a contactarnos...')
})