const express = require('express')
const mongoose = require('mongoose')

const app = express()
app.use(express.json())
const port = 3000


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
    const aposta = await Aposta.findOneAndDelete({"id": req.params.id})
    res.send(aposta)
})

app.post('/cadastra', async (req, res) => {
    const aposta = new Aposta({
        id: req.body.id,
        name: req.body.name,
        cpf: req.body.cpf,
        numeros: req.body.numeros
    })
    await aposta.save()
    res.send(aposta)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
    mongoose.connect('mongodb+srv://vermoncom:KL8KZy1sU4YeTB7x@mega-sena-dell-api.4wgsdit.mongodb.net/?retryWrites=true&w=majority&appName=mega-sena-dell-api')
})

