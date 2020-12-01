const express = require("express")
const nodemailer = require("nodemailer")
const joi = require('joi')
const expressFileUpload = require('express-fileupload')
const { MongoClient, ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')

const app = express()

const API = express.Router()

const {
    HOST_MAIL,
    PUERTO_MAIL,
    CASILLA_MAIL,
    CLAVE_MAIL,
    MONGODB_USER,
    MONGODB_PASS,
    MONGODB_HOST,
    MONGODB_BASE,
    JWT_SECRET
 } = process.env

const port = 1000   //mas allá del 1000 usualmente están disponibles

const miniOutlook = nodemailer.createTransport({
    host: HOST_MAIL,
    port: PUERTO_MAIL,
    auth: {
        user: CASILLA_MAIL,
        pass: CLAVE_MAIL
    }
})

const schema = joi.object({
    nombre : joi.string().max(30).required(),
    email : joi.string().email({ minDomainSegments : 3, tlds: { allow: ['com', 'net', 'tech'] } }).required(),
    asunto : joi.number().integer().required(),
    mensaje : joi.string().required()
})

const ConnectionString = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASS}@${MONGODB_HOST}/${MONGODB_BASE}?retryWrites=true&w=majority`

const ConnectionDB = async () => {
    const client = await MongoClient.connect(ConnectionString, { useUnifiedTopology : true })

    return await client.db('catalogo')
}

const verifyToken = (req, res, next) => {
    const { _auth } = req.cookies

    //jwt.verify(TOKEN, SECRET, CALLBACK)
    jwt.verify(_auth, JWT_SECRET, (error, data) => {

        if( error ){
            res.end("ERROR: Token expirado o invalido...gato!")
        } else {
            next()
        }

    })
}

app.listen(port)

// Middlewares //
app.use( express.static('public') )
app.use( express.json() ) //<- de "application/json" a Object
app.use( express.urlencoded({ extended : true }) ) //<- de "application/x-www-form-urlencoded" a Object
app.use( expressFileUpload() ) //<- de "multipart/form-data" a Object + File
app.use( cookieParser() )

app.use("/api", API )
/*
// Plantilla modelo para "endpoints" de express() //
app.TIPO_HTTP("/RUTA", (req, res) => {

})
*/
app.post("/enviar", (req, res) => {
    const contacto = req.body // <-- Datos desde HTTP Body

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

/******************************/
/************ API ************/

/** Create **/
API.post("/v1/pelicula", async (req, res) => {

    const pelicula = req.body

    const db = await ConnectionDB()

    const peliculas = await db.collection('peliculas')

    const { result } = await peliculas.insertOne( pelicula )

    const { ok } = result

    const respuesta = {
        ok,
        msg : ok ? "Pelicula guardada correctamente" : "Error al guardar la pelicula"
    }

    res.json(respuesta)
})

/** Read **/
API.get("/v1/pelicula", verifyToken, async (req, res) => {

    //console.log( req.query.id ) // <-- Datos desde HTTP Query String

    const db = await ConnectionDB()

    const peliculas = await db.collection('peliculas').find({}).toArray()

    res.json(peliculas)
})

API.get("/v1/pelicula/:id", async (req, res) => {

    const { id } = req.params

    try {

        const db = await ConnectionDB()

        const peliculas = await db.collection('peliculas')
    
        const busqueda = { "_id" : ObjectId(id) }
    
        const resultado = await peliculas.find( busqueda ).toArray()

        return res.json({ ok : true, resultado })

    } catch(error){

        return res.json({ ok : false, msg : "Pelicula no encontrada" })

    }

})

/** Update **/
API.put("/v1/pelicula/:id", async (req, res) => {

    const { id } = req.params
    
    const pelicula = req.body // <-- Ej: { titulo : "xxxx", estreno : 9999, genero : "zzzz" }

    const db = await ConnectionDB()

    const peliculas = await db.collection('peliculas')

    const busqueda = { "_id" : ObjectId(id) }

    const nuevaData = {
        $set : { // aca van las propiedades que voy a actualizar...
            ...pelicula
        }
    }

    const { result } = await peliculas.updateOne(busqueda, nuevaData)

    const { ok } = result

    const respuesta = {
        ok,
        msg : ok ? "Pelicula actualizada correctamente" : "Error al actualizar la pelicula"
    }

    res.json(respuesta)
})

/** Delete **/
API.delete("/v1/peliculas", async (req, res) => {
    const db = await ConnectionDB()

    const respuesta = {
        msg : "Acá vamos a borrar peliculas..."
    }
    res.json(respuesta)
})

/* Auth */
API.post("/v1/auth", (req, res) => {

    const { mail, pass } = req.body

    const userDB = {
        "_id" : ObjectId("5fc6cee436eab07355414f83"),
        "name" : "Han Nova Solo",
        "mail" : "han.nova@solo.com",
        "pass" : "$2b$10$lSGcO.CSXRri5LfS5TkTHO/zuEEaHFNMntxUsYzK.1NYQlq6Ikt9G"
    }
    
    bcrypt.compare(pass, userDB.pass, (error, resultado) => {

        if( error ){

            return res.json({ auth : false, msg : 'No pudimos verificar tu contraseña' })

        } else if( resultado === false ){

            return res.json({ auth : false, msg : 'La pass no coincide :(' })

        } else {
            //La pass coincide...
            //const token = jwt.sign(PAYLOAD, CONFIGS, SECRETKEY)    
            const token = jwt.sign({ email : userDB.mail, name : userDB.name, expiresIn : 60 * 60 }, JWT_SECRET)

            //res.cookie(NOMBRE, CONTENIDO, CONFIG)
            res.cookie("_auth", token, {
                expires : new Date( Date.now() + 1000 * 60 * 3 ),
                httpOnly : true,
                sameSite : 'Lax',
                secure : false
            })

            return res.json({ auth : true })
        }
    })  

    //res.json(rta)
})

API.post('/v1/register', (req, res) => {
    const { name, mail, pass } = req.body

    bcrypt.hash(pass, 10, (error, hash) => {

        if(error){
            console.log('Como que la pass no se encripto, viteh!')
        } else {
            console.log("Tengo la password, viteh!")
            console.log(hash)
            //ACA HAY QUE GUARDAR EL USUARIO CON SU PASS EN LA BD
        }

    })
    res.end('Mirad la consola...')
})