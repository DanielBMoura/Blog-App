const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Usuario = new Schema({
    nome: {
        type: String,
        required: true
    }, 
    email: {
        type: String,
        required: true
    },
    eAdmin: {   // <- Se o valor for 0, ele é usuario comum, se for 1, ele é admin
        type: Number,
        default: 0
    },
    senha: {
        type: String,
        required: true
    }
})

mongoose.model('usuarios', Usuario)