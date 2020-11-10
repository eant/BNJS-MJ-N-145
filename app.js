const express = require("express")
const nodemailer = require("nodemailer")
const joi = require('joi')
const expressFileUpload = require('express-fileupload')
const mongodb = require('mongodb').MongoClient

const app = express()

const port = 1000   //mas allá del 1000 usualmente están disponibles

const miniOutlook = nodemailer.createTransport({
    host: process.env.HOST_MAIL,
    port: process.env.PUERTO_MAIL,
    auth: {
        user: process.env.CASILLA_MAIL,
        pass: process.env.CLAVE_MAIL
    }
})

const schema = joi.object({
    nombre : joi.string().max(30).required(),
    email : joi.string().email({ minDomainSegments : 3, tlds: { allow: ['com', 'net', 'tech'] } }).required(),
    asunto : joi.number().integer().required(),
    mensaje : joi.string().required()
})

app.listen(port)
// Middlewares //
app.use( express.static('public') )
app.use( express.json() ) //<- de "application/json" a Object
app.use( express.urlencoded({ extended : true }) ) //<- de "application/x-www-form-urlencoded" a Object
app.use( expressFileUpload() ) //<- de "multipart/form-data" a Object + File

/*
// Plantilla modelo para "endpoints" de express() //
app.TIPO_HTTP("/RUTA", (req, res) => {

})
*/
app.post("/enviar", (req, res) => {
    const contacto = req.body

    // Captura de archivos enviados vía HTTP
    /*  
    const { archivo } = req.files
    
    const ubicacion = __dirname + "/public/uploads/" + archivo.name

    archivo.mv(ubicacion, error => {
        if( error ){
            console.log("No se movio")
        }
    })

    return res.end("Mira la consola...")
    */

    const { error, value } = schema.validate( contacto, { abortEarly : false } )

    if( error ){

        const msg = {
            ok : false,
            error : error.details.map( e => e.message.replace(/"/g, "") )
        }

        res.json( msg )
    } else {
        miniOutlook.sendMail({
            from : contacto.correo, // sender address
            to : "silvio.messina@eant.tech", // list of receivers
            replyTo : contacto.correo,
            subject : `Asunto #${contacto.asunto}`, // Subject line
            html : `<blockquote>${contacto.mensaje}</blockquote>"`, // html body
        })
        res.end('Desde acá vamos a enviar un email de contacto :o')
    }  

})

/** Create **/
app.post("/api/pelicula", (req, res) => {
    const respuesta = {
        msg : "Acá vamos a crear peliculas..."
    }
    res.json(respuesta)
})
/** Read **/
app.get("/api/pelicula", (req, res) => {
    //db.getCollection('peliculas').find({})
    const respuesta = {
        msg : "Acá vamos a ver peliculas..."
    }
    res.json(respuesta)
})
/** Update **/
/** Delete **/