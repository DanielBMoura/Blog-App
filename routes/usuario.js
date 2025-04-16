const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')    // <- Trás o model de Usuario para ser manipulado nesse arquivo
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const eAdmin = require('../helpers/eAdmin')

router.get('/registro', (req, res) => { // <- Formulário para criar um novo usuário
    res.render('usuarios/registro', {
        layout: 'main',
        isAdm: false
    })
})

router.post('/registro', (req, res) => {    // <- Recebe o formulário e faz a validação para ver se ele é válido
    let erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: 'Nome inválido'})
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({texto: 'E-mail inválido'})
    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({texto: 'Senha inválida'})
    }
    if (req.body.senha.length < 4) {
        erros.push({texto: 'Senha muito curta'})
    }
    if (req.body.senha != req.body.senha2) {    // <- Verifica se a senha1 é igual ao Repetir senha 
        erros.push({texto: 'As senhas são diferentes, tente novamente'})
    }

    if (erros.length > 0) {
        res.render('usuarios/registro', {
            erros,
            layout: 'main',
            isAdm: false
        })    // <- Leva os erros para o front-end
    } else {
        Usuario.findOne({email: req.body.email}).then((usuario) => {    // Faz uma pesquisa para ver se o email enviadojá existe no BD
            if (usuario) {  // Se o email existir
                req.flash('error_msg', 'E-mail já cadastrado')
                res.redirect('/usuarios/registro')
            } else {    // Se o email não existir
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash('error_msg', 'Houve um erro durante o salvamento do usuario')
                            res.redirect('/')
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash('success_msg', 'Usuario criado com sucesso')
                            res.redirect('/')
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro ao criar o usuario, tente novamente')
                            res.redirect('/usuarios/registro')
                        })
                    })
                })
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/')
        })
    }
})

router.get('/login', (req, res) => {
    res.render('usuarios/login', {
        layout: 'main',
        isAdm: false
    })
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {    // Usar essa função sempre que for autenticar algo, o local é o tipo de autenticação
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) {
            return next(err)
        }
        req.flash('success_msg', 'Deslogado com sucesso')
        res.redirect('/')
    })
})

module.exports = router