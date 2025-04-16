const express = require('express')
const router = express.Router() // <- Criar rotas em arquivos separados
const mongoose = require('mongoose')
require('../models/Categoria')  // <- Dá um require no model de Categoria, para que ele possa acessar o Banco de Dados desse arquivo
const Categoria = mongoose.model('categorias') // <- Passar o mesmo nome que eu coloquei em: mongoose.model('categorias'), que está em: models/Categoria
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const {eAdmin} = require('../helpers/eAdmin')   // Cria uma variavel de nome 'eAdmin' com o bloco de código que está dentro de module.exports no outro arquivo
    // Toda rota que tiver que sre protegida, terá que ter essa variavel antes do req, res


// Definição de rotas
    router.get('/categorias', eAdmin, (req, res) => {

        // Faz uma lista de todas as categorias já criadas, da mais nova para a mais velha
        // Passa 'categorias' como parametro, para que no arquivo categorias.handlebars, ele possa mostrar as categorias e manipula-las

        Categoria.find().lean().sort({date: 'desc'}).then((categorias) => {
            res.render('admin/categorias', {
                categorias: categorias,
                layout: 'main',
                isAdm: true
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar as categorias')
            res.redirect('/admin')
        })
    })

    router.get('/categorias/add', eAdmin, (req, res) => { 

        // Pagina do formulario para criar uma nova categoria
        
        res.render('admin/addcategorias', {
            layout: 'main',
            isAdm: true
        })
    })

    router.post('/categorias/nova', eAdmin, (req,res) => {

        // Recebe os dados vindo do formulario de criação de nova categoria
        // Faz a validação de possiveis erros que podem ter na hora de criar uma nova categoria, como: nome curto, nome e/ou slug invalido

        let erros = []

        if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
            erros.push({texto: 'Nome inválido'})
        }
        if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
            erros.push({texto: 'Slug inválido'})
        }
        if (req.body.nome.length < 2) {
            erros.push({texto: 'Nome da categoria muito pequeno'})
        }
        if (erros.length > 0) {
            res.render('admin/addcategorias', {
                erros: erros,
                layout: 'main',
                isAdm: true
            })
        } else {

            // Executa isso se o formulario foi preenchido corretamente
            // Cria um novo objeto Categoria, preenchendo o nome e o slug que vem do formulario

            const novaCategoria = {
                nome: req.body.nome,
                slug: req.body.slug,
            }

            // Cria uma nova categoria no Banco de Dados passando o objeto anterior como parametro

            new Categoria(novaCategoria).save().then(() => {
                req.flash('success_msg', 'Categoria criada com sucesso')
                res.redirect('/admin/categorias')
            }).catch((err) => {
                req.flash('error_msg', 'Erro ao salvar categoria, tente novamente')
                res.redirect('/admin')
            })
        }
    })

    router.get('/categorias/edit/:id', eAdmin, (req, res) => {

        // Carrega essa rota: /categorias/edit/:id -- passando o id que a pessoa entrar como parametro, ele faz isso na hora do clique
        // já que no link para rota, ele pede o id como parametro

        Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {     // <- O findOne faz a busca do documento no Banco de Dados
        res.render('admin/editcategorias', {
            categoria: categoria,
            layout: 'main',
            isAdm: true
        })  // <- Abre a postagem, passando 'categoria' como parametro
        }).catch((err) => {
            req.flash('error_msg', 'Essa categoria não exite')
            res.redirect('/admin/categorias')
        })
    })

    router.post('/categorias/edit', eAdmin, (req, res) => {

        // Rota que recebe os dados vindo do formulario de edição e faz as validações (como a feita anteriormente)
        
        let erros = []

        if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
            erros.push({texto: 'Nome inválido'})
        }
        if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
            erros.push({texto: 'Slug inválido'})
        }
        if (req.body.nome.length < 2) {
            erros.push({texto: 'Nome da categoria muito pequeno'})
        }
        if (erros.length > 0) {
            res.render('admin/editcategorias', {
                erros: erros,
                layout: 'main',
                isAdm: true
            })
        } else {

            // Executa esse código se tudo estiver certo

            Categoria.findOne({_id: req.body.id}).then((categoria) => {

                // Faz a subistituição dos valores e salva no Banco de Dados
                
                categoria.nome = req.body.nome
                categoria.slug = req.body.slug
    
                categoria.save().then(() => {
                    req.flash('success_msg', 'Categoria reeditada com sucesso')
                    res.redirect('/admin/categorias')
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro interno ao salvar a edição da categoria')
                    res.redirect('/admin/categorias')
                })
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao editar a categoria')
                res.redirect('/admin/categorias')
                console.log(err)
            })
        }
    })

    router.post('/categorias/deletar', eAdmin, (req, res) => {

        // Procura o documento pelo id, e se achar ele é deletado
        
        Categoria.deleteOne({_id: req.body.id}).then(() => {
            req.flash('success_msg', 'Categoria Deletada com sucesso')
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash('erro_msg', 'Houve um erro ao deletar categoria')
            res.redirect('/admin/categorias')
        })
    })

    router.get('/postagens', eAdmin, (req, res) => {

        // Faz a listagem de todas as postagens usando o metodo Populate, que ao invés de trazer apenas o ID da categoria, tras o objeto por completo de categoria,
        // então, podemos usar o nome da categoria de forma mais simples

        Postagem.find().lean().populate({path: 'categoria', strictPopulate: false}).sort({date: 'desc'}).then((postagens) => {
            res.render('admin/postagens', {
                postagens: postagens,
                layout: 'main',
                isAdm: true
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar as postagens')
            res.redirect('/admin')
        })
    })

    router.get('/postagens/add', eAdmin, (req, res) => {

        // Página de adicionar novas postagens

        Categoria.find().lean().then((categorias) => {
            res.render('admin/addpostagem', {
                categorias: categorias,
                layout: 'main',
                isAdm: true
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao carregar o formulário')
            res.redirect('/admin')
        })
    })

    router.post('/postagens/nova', eAdmin, (req, res) => {

        // Rota que recebe o formulario vindo de: addpostagem.handlebaras, e faz a sua verificação

        let erros = []

        if (req.body.categoria == '0') {
            erros.push({texto: 'Categoria inválida, registre uma categoria'})
        }
        if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
            erros.push({texto: 'Titulo inválido'})
        }
        if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
            erros.push({texto: 'Slug inválido'})
        }
        if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
            erros.push({texto: 'Descrição inválida'})
        }
        if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
            erros.push({texto: 'Conteúdo inválido'})
        }
        if (erros.length > 0) {
            res.render('admin/addpostagem', {
                erros: erros,
                layout: 'main',
                isAdm: true
            })
        } else {

            // Cria um novo objeto Postagem e passa ele como parametro na criação de um nova Postagem, criando-a no Banco de Dados

            const novaPostagem = {
                titulo: req.body.titulo,
                slug: req.body.slug,
                descricao: req.body.descricao,
                conteudo: req.body.conteudo,
                categoria: req.body.categoria
            }
            new Postagem(novaPostagem).save().then(() => {
                req.flash('success_msg', 'Postagem criada com sucesso')
                res.redirect('/admin/postagens')
            }).catch((err) => {
                res.flash('error_msg', 'Houve um erro durante o salvamento da postagem')
                res.redirect('/admin/postagens')
            })
        }
    })

    router.get('/postagens/edit/:id', eAdmin, (req, res) => {

        // Faz a primeira busca no Banco de Dados, procurando a postagem com o ID que foi passado como parametro, se ele achar, ele armazena o objeto dentro 
        // da variavel "postagem", após isso, ele procura a todas as categorias armazenadas no Banco de Dados e armaneza elas na variavel "categorias",
        // após isso ele passa as duas como objetos para a página "editpostagens", para que lá eles sejam manipulados

        Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
            Categoria.find().lean().then((categorias) => {
                res.render('admin/editpostagens', {
                    categorias: categorias, 
                    postagem: postagem,
                    layout: 'main',
                    isAdm: true
                })
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao listar as categorias')
                res.redirect('/admin/postagens')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao carregar o formulario de edição')
            res.redirect('/admin/postagens')
        })

    })

    router.post('/postagem/edit', eAdmin, (req, res) => {

        // Procura o ID da postagem, e armazena o objeto na variavel "postagem", logo ele faz a reatribuição dos valores, e salva no MongoDB

        Postagem.findOne({_id: req.body.id}).then((postagem) => {
            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria

            postagem.save().then(() => {
                req.flash('success_msg', 'Postagem editada com sucesso')
                res.redirect('/admin/postagens')
            }).catch((err) => {
                req.flash('error_msg', 'Erro interno')
                res.redirect('/admin/postagens')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a edição')
            res.redirect('/admin/postagens')
        })
    })

    router.get('/postagens/deletar/:id', eAdmin, (req, res) => {    // Essa forma de deletar não é tão segura

        // Ele pega o id passado como parametro, e usando o metodo 'deleteOne', deleta a postagem

        Postagem.deleteOne({_id: req.params.id}).then(() => {
            req.flash('success_msg', 'Postagem deletada com sucesso')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/admin/postagens')
        })
    })

module.exports = router