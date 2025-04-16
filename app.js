// Carregando módulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const admin = require('./routes/admin')   // OBS: Sempre criar a constante com o mesmo nome do arquivo da rota
    const path = require('path')    // <- Módulo padrão do Node
    const app = express()   // <- Recebe a função que vem do express
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')
    require('./models/Postagem')
    const Postagem = mongoose.model('postagens')
    require('./models/Categoria')
    const Categoria = mongoose.model('categorias')
    const usuarios = require('./routes/usuario')
    const passport = require('passport')
    require('./config/auth')(passport)
    require('dotenv').config()
    const db = require("./config/db")

// Configurações
    // Sessão
        app.use(session({
            secret: 'cursodenode',  // Chave secreta usada para garantir que as sessões sejam seguras.
            resave: true,
            saveUninitialized: true // Uma nova sessão é criada e salva, mesmo se o usuário não tiver feito nada.
        }))

        app.use(passport.initialize())
        app.use(passport.session())

        app.use(flash())    //Envia mensagens que aparecem uma vez e depois somem
    // Middlewares
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg')   // <- Cria uma variavel global de mensagem de sucesso
            res.locals.error_msg = req.flash('error_msg')   // <- Cria uma variavel global de mensagem de erro
            res.locals.error = req.flash('error')
            res.locals.user = req.user || null  // - Essa variavel armazena os dados no usuario autenticado
            next()
        })
    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')
    // Mongoose
        mongoose.Promise = global.Promise
        mongoose.connect(db.mongoURI).then(() => {
            console.log('Conexão com o MongoDB feita com sucesso')
        }).catch((err) => {
            console.log('Falha ao se conectar com o Mongo: ' + err)
        })
    // Public
        app.use(express.static(path.join(__dirname, 'public'))) // <- Falamos pro express que a pasta que está guardando nossos arquivos estaticos é: public

// Rotas    // <- OBS: Não colocar várias rotas em um mesmo arquivo - Sempre que criar rotas em outro arquivo, eu preciso vir aqui e falar pro express que ele existe
    app.get('/', (req, res) => {    // <- Cria uma rota principal
        Postagem.find().lean().populate('categoria').sort({date: 'desc'}).then((postagens) => {
            res.render('index', {
                postagens: postagens,
                layout: 'main',
                isAdm: false
            }) // Lista as postagens
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/404')
        })
    })

    app.get('/postagem/:slug', (req, res) => {  // <- Passa o slug pelo parametro, montando a rota 
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {   // <- Pesquisa no BD para ver se acha uma postagem que tenha o mesmo slug
            if (postagem) { // Vê se a postagem realmente existe 
                res.render('postagem/index', {
                    postagem: postagem,
                    layout: 'main',
                    isAdm: false
                })  // <- Se existir, ele passa a postagem para o front-end
            } else {
                req.flash('error_msg', 'Está postagem não existe')
                res.redirect('/')
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/')
        })
    })

    app.get('/categorias', (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render('categorias/index', {
                categorias: categorias,
                layout: 'main',
                isAdm: false
            })    // <- Faz a pesquisa no BD, e trás todas as categorias para serem listadas
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao listar as categorias')
            res.redirect('/')
        })
    })

    app.get('/categorias/:slug', (req, res) => {    // Pesquisa o slug da categoria -- Traduzindo está escrito: "Acha uma postagem que tem uma categoria igual a essa"
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {    // Procura no BD, a categoria que tem o slug passado no parametro
            if (categoria) {    // Se ele achar a categoria:
                // Busca pelos posts que pertencem a categoria -- ele trás o objeto da categoria

                Postagem.find({categoria: categoria._id}).lean().then((postagens) => {  // Faz a pesquisa no BD sobre quais posts são cadastrados naquela categoria,
                    // O "categoria" é o atributo de Postagem no BD, o "categoria._id" é o objeto que é passado, ai ele faz a comparação 

                    res.render('categorias/postagens', {
                        postagens: postagens, 
                        categoria: categoria,
                        layout: 'main',
                        isAdm: false
                    }) // <- Leva os objetos para o front-end
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao listar os posts')
                    res.redirect('/')
                })

            } else {
                req.flash('error_msg', 'Está categoria não existe')
                res.redirect('/')
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao carregar a página desta categoria')
            req.redirect('/')
        })
    })

    app.get('/404', (req, res) => { // <- Rota para se algo der erro
        res.send('ERRO 404!!!')
    })

    app.use('/admin', admin)    // <- Cria uma rota "admin" que recebera todas as rotas vindas do arquivo Admin.js
    app.use('/usuarios', usuarios)  // <- Cria uma rota "usuarios" que recebera todas as rotas vindas do arquivo usuario.js

// Outros
    // Abrindo o servidor
        const PORT = process.env.PORT || 8081
        app.listen(PORT, () => {
            console.log('Servidor Rodando')
        })
