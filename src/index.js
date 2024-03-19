const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')

//
mongoose.connect('mongodb+srv://vermoncom:KL8KZy1sU4YeTB7x@mega-sena-dell-api.4wgsdit.mongodb.net/?retryWrites=true&w=majority&appName=mega-sena-dell-api').then(
    ()=> console.log("CONNECTED")
)
app.use(express.json())
app.use(cors())


const port = 3000

var idGlobal = 1000;


const Aposta = mongoose.model('Aposta', {
    id: Number,
    name: String,
    cpf: String,
    numeros: [Number]
});


app.get('/apostas', async (req, res) => {
    const apostas = await Aposta.find()
    res.send(apostas)
})

app.delete('/deleta/:id', async (req,res) => {
    if(req.params.id == 666){
        await Aposta.deleteMany({})
    } 
    const aposta = await Aposta.findOneAndDelete({"_id": req.params.id})
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Request-Width, Content-Type, Accept");    
    res.send(aposta)
})

app.post('/cadastra', async (req, res) => {
    if(req.body.name === undefined || req.body.cpf === undefined || req.body.numeros === undefined
        || req.body.name === "" || req.body.cpf === "" || req.body.numeros.length === 0){
        console.log(req.body)
        res.status(400).send("Tente novamente após preencher corretamente os campos.")
        return
    }
    console.log("passou")
    console.log(req.body.name, req.body.cpf, req.body.numeros)

    const lastId = await Aposta.countDocuments() + 1
    console.log(lastId)

    const aposta = new Aposta({
        id: lastId + 1000,
        name: req.body.name,
        cpf: req.body.cpf,
        numeros: req.body.numeros
    })

    await aposta.save()
    res.send(aposta)
})




app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

