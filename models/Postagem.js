const mongoose = require('mongoose')    // Carrega o módulo de mongoDB 
const Schema = mongoose.Schema  // Faz essa atribuição para não precisr digitar mongoose.Schema 

// Define o Schema e seu nome
const Postagem = new Schema({
    titulo: {
        type: String,
        required: true
    }, 
    slug: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    categoria: {
        type: Schema.Types.ObjectId,    // <- Relacionamento com a tabela de Categoria
        ref: 'categorias',   // <- Passa o nome que foi definido em Categoria.js
        required: true
    },
    data: {
        type: Date,
        default: Date.now() // Pega a data de criação do Post
    }
}) 

// Cria o model no MongoDB, ele se chama postagens e recebe como parametro a constante Postagem, que define como será a estrutura do documento
mongoose.model('postagens', Postagem)