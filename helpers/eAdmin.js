// Helpers são pequenas funções, e podem ser criados para qualquer finalidade
// Nesse caso, ele vai ser utilizado para verificar se o usuario está autenticado e se ele é admin ou não

module.exports = {
    eAdmin: function(req, res, next) {
        if (req.isAuthenticated() && req.user.eAdmin == 1) {    // Função que verifica se certo usuario está autenticado ou não E se ele tem o eadmin igual a 1
            return next()   // <- Se tive, ele pode acessar normalmente a rota
        }
        req.flash('error_msg', 'Você precisa ser Admin para acessar essa rota') // Se não, isso é executado
        res.redirect('/')
    }
}