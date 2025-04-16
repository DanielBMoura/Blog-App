// Carregando pacotes
    const localStrategy = require('passport-local').Strategy
    const mongoose = require('mongoose')
    const bcrypt = require('bcryptjs')

// Model de usuario
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')

module.exports = function (passport) {  // Aqui vai ficar todo o sistema de autenticação
    
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {  // {usernameField: 'email'} -> Qual vai ser o campo que vai ser analisado?
        Usuario.findOne({email: email}).then((usuario) => { // Pesquisa um usuario que tenha um email igual ao que foi passado na autenticação: usernameField: 'email'
            if (!usuario) {
                return done(null, false, {message: 'Está conta não existe'})   // O 'Done' é uma função de callback

                /* Em "Done", a gente pssa tres parametros:
                    Os dados da conta que foram autentica (null),
                    Se a autenticação aconteceu com sucesso ou não (false),
                    Mensagem;
                */
            }
            bcrypt.compare(senha , usuario.senha, (erro, batem) => {    // Faz comparação da senha e a senha que foi enviada - Usar o bcrypt pois a senha está hash
                if(batem){  // Se as senhas Batem
                    return done(null, usuario)
                } else {    // Se as senhas não batem
                    return done(null, false, {message: 'Senha incorreta'})
                }
            }) 
        }) 
    }))

    passport.serializeUser((usuario, done) => { // Salva os dados do usuario em uma sessão
        done(null, usuario.id)
    })    

    passport.deserializeUser((id, done) => {    // Salva os dados de usuario na sessão   
        Usuario.findById(id).then((usuario) => {   // Função para procurar um usuario pelo seu id
            done(null, usuario)
            console.log(usuario)
        }).catch((err) => {
            done(null, false,{message: 'Algo deu errado'})
        })
    })

}

// Aula 58
