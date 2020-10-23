const express = require("express")
const nodemailer = require("nodemailer")
const app = express()

const port = 1000   //mas allá del 1000 usualmente están disponibles

const miniOutlook = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'raul80@ethereal.email',
        pass: 'C9qndzm6Xq3w4f4Hrb'
    }
})

app.listen(port)
app.use( express.static('public') )
app.use( express.urlencoded({ extended : true }) )

/*
// Plantilla modelo para "endpoints" de express() //
app.TIPO_HTTP("/RUTA", (req, res) => {

})
*/
app.post("/enviar", (req, res) => {
    const contacto = req.body
    
    miniOutlook.sendMail({
        from : contacto.correo, // sender address
        to : "silvio.messina@eant.tech", // list of receivers
        subject : `Asunto #${contacto.asunto}`, // Subject line
        html : `<blockquote>${contacto.mensaje}</blockquote>"`, // html body
    })

    res.end('Desde acá vamos a enviar un email de contacto :o')
})