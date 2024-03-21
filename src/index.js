const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')

//conecta a db do bongo
mongoose.connect('mongodb+srv://vermoncom:KL8KZy1sU4YeTB7x@mega-sena-dell-api.4wgsdit.mongodb.net/?retryWrites=true&w=majority&appName=mega-sena-dell-api').then(
    ()=> console.log("CONNECTED")
)
app.use(express.json())
app.use(cors())


const port = 3000

//cria um model dos documentos que serao armazenados
const Aposta = mongoose.model('Aposta', {
    id: Number,
    name: String,
    cpf: String,
    numeros: [Number]
});

//funcao pra pegar um valor aleatorio entre 1 e 50
const getRandomInt = (min, max) => {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

//endpoint que realiza o sorteio e retorna os vencedores e informacoes adicionais
app.get('/sorteio', async (req,res) => {
    var apostas_vencedoras = []
    var numeros_sorteados = []
    var rodada = 0
    var vencedor = false

    //ja pega as apostas em ordem alfabetica para facilitar
    await Aposta.find().sort({name:1}).then(apostas => {

        //cria um array de 50 posicoes com 0s e percorre as apostas aumentando em 1 na posicao correspondente ao numero apostado
        qnt_numeros_apostados = Array(50).fill(0)
        apostas.forEach(aposta => {
            aposta.numeros.forEach(element => {
                //element -1 pq o element nunca sera 0 ou 51 
                qnt_numeros_apostados[element -1] = qnt_numeros_apostados[element -1] + 1
            });

        });

        // sorteia os 5 primeiros valores, verificando se o numero sorteado ja esta entre os sorteados, caso esteja, repete ate achar um que nao esta.
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
                    //verifica se esse numero esta entre os sorteados, caso esteja soma na variavel numeros_acertados.
                    if(numeros_sorteados.includes(n)){
                        numeros_acertados++                
                    }
                    //se chegar a 5, ou seja, acertou todos, entra para o array de apostas vencedoras e indica pelo bool vencedor que acabou o sorteio
                    if(numeros_acertados === 5){
                        apostas_vencedoras.push(element)
                        vencedor = true
                    }
                })
        
            })
            // acaba o sorteio
            if(vencedor === true){
                break
            }
            //caso contrario +1 rodada
            rodada++

            //sorteia mais um numero aleatorio
            var l = getRandomInt(1, 51)
            while(numeros_sorteados.includes(l)){
                l = getRandomInt(1, 51)
            }
            numeros_sorteados.push(l)
        }

        //monta a response e envia
        const resposta = {
            "venceu": vencedor,
            "numeros_sorteados": numeros_sorteados,
            "rodada": rodada,
            "apostas_vencedoras": apostas_vencedoras,
            "numeros_apostados": qnt_numeros_apostados
        }
        res.send(resposta)
        console.log(resposta)
        }).catch(error => {
            res.status(500).send("Ocorreu um erro ao realizar o sorteio.")
        })
})

//endpoint que retorna todas as apostas realizadas
app.get('/apostas', async (req, res) => {
    //find sem nada como parametro busca todos os documentos
    await Aposta.find().then(apostas => {
        res.send(apostas)
    }).catch(error => {
        res.status(500).send("Ocorreu um erro ao cadastrar a aposta.")
    })
})

//endpoint que retorna todas as apostas realizadas
app.get('/zeraBanco', async (req,res) => {
    //deleteMany sem paeametros deleta todos os documentos do banco
        await Aposta.deleteMany({}).catch(error => {
            res.status(500).send("Ocorreu um erro ao delear o banco.")
        })

        res.send("Apostas deletadas")

})

//endpoint busca um documento pelo atributo id e deleta ele
app.delete('/deleta', async (req,res) => {

    const aposta = await Aposta.findOneAndDelete({"id": req.query.id}).catch(error => {
        res.status(500).send("Ocorreu um erro ao deletar a aposta.")
    })
    res.send(aposta)
})



//endpoint que armazena as apostas no banco
app.post('/cadastra', async (req, res) => {
    //algumas verificacoes para saber a integridade dos dados do request
    if(req.body.name === undefined || req.body.cpf === undefined || req.body.numeros === undefined
        || req.body.name === "" || req.body.cpf === "" || req.body.numeros.length === 0){
        console.log(req.body)
        res.status(400).send("Tente novamente após preencher corretamente os campos.")
        return
    }

    //findOne em combinacao com o sort retorna apenas 1 do topo da lista de sort. nesse caso -1 para filtrar em ordem decrescente de ids, ou seja, pegar o maior
    const lastAposta = await Aposta.findOne().sort({ id: -1 }).catch(error => {
        res.status(500).send("Ocorreu um erro ao encontrar a última aposta.")
    })
    
    // caso nao tenha documentos no banco, ou seja, lastAposta for falso, coloca lastId como 1000 ou a primeira aposta.
    let lastId = 1000;
    if (lastAposta) {
        lastId = lastAposta.id
    }

    //monta o documento com +1 no id
    const aposta = new Aposta({
        id: lastId + 1,
        name: req.body.name,
        cpf: req.body.cpf,
        numeros: req.body.numeros
    })

    //salva no banco e envia o que foi colocado no banco como resposta.
    await aposta.save()
    res.send(aposta)
})



//habilita o servidor a escutar nessa porta (3000)
app.listen(port, () => {
    console.log(`Porta ${port}`)
})

