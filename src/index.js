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

var qnt_numeros_apostados = Array(50).fill(0)

const Aposta = mongoose.model('Aposta', {
    id: Number,
    name: String,
    cpf: String,
    numeros: [Number]
});

const getRandomInt = (min, max) => {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

app.get('/sorteio', async (req,res) => {

    var apostas_vencedoras = []
    var numeros_sorteados = []
    var rodada = 0
    var vencedor = false

    const apostas = await Aposta.find().then(apostas => {

    for(var i = 0 ; i < 5; i++ ){
        var m = getRandomInt(1, 51)
        if(numeros_sorteados.includes(m)){
            i--
            continue
        }
        numeros_sorteados.push(m)
        console.log(m)
    }
        
    while(rodada < 25){
        apostas.forEach(element => {
            //para todos os numeros da aposta
            var numeros_acertados = 0
            element.numeros.forEach(n => {
                //verifica se esse numero esta entre os sorteados
                if(numeros_sorteados.includes(n)){
                    numeros_acertados++                
                }
                //se chegar a 5, ou seja, acertou todos, entra para o array de apostas vencedoras
                if(numeros_acertados === 5){
                    apostas_vencedoras.push(element)
                    vencedor = true
                }
            })
    
        })
        if(vencedor === true){
            break
        }
        rodada++
        var l = getRandomInt(1, 51)
        while(numeros_sorteados.includes(l)){
            l = getRandomInt(1, 51)
        }
        numeros_sorteados.push(l)
    }
    }).finally(() => {
        const resposta = {
            "venceu": vencedor,
            "numeros_sorteados": numeros_sorteados,
            "rodada": rodada,
            "apostas_vencedoras": apostas_vencedoras,
            "numeros_apostados": qnt_numeros_apostados
        }
        res.send(resposta)
        console.log(resposta)
        //console.log(resposta)
    })
    
})

// app.get('/numerosApostados', async (req, res) => {
//     res.send(qnt_numeros_apostados)
// })

app.get('/apostas', async (req, res) => {
    const apostas = await Aposta.find().then(apostas => {
        qnt_numeros_apostados = Array(50).fill(0)
        apostas.forEach(aposta => {

            aposta.numeros.forEach(element => {
                qnt_numeros_apostados[element -1] = qnt_numeros_apostados[element] + 1
            });

        });
        

        res.send(apostas)
    })
})

app.delete('/deleta/:id', async (req,res) => {
    //apenas para debug, deleta toda a colecao.
    if(req.params.id == 666){
        await Aposta.deleteMany({})
    } 

    req.body.numeros.forEach(element => {
        qnt_numeros_apostados[element -1] = qnt_numeros_apostados[element] + 1
    });

    const aposta = await Aposta.findOneAndDelete({"_id": req.params.id})
 
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

    req.body.numeros.forEach(element => {
        qnt_numeros_apostados[element -1] = qnt_numeros_apostados[element] + 1
        
    });
    console.log(qnt_numeros_apostados)

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

