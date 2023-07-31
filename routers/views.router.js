const express = require('express')
const {Router} = express
const viewsRouter = new Router()

function checkUserLogin (req, res, next) {
    let {userMail} = req.session
    if(userMail) {
        next()
    }
    else res.redirect('/')
}

viewsRouter.get('/userRegistration', (req, res) => {
    res.render('register', {})
})

viewsRouter.get('/', (req, res) => {
    res.render('login', {})
})

viewsRouter.get('/products', checkUserLogin, (req, res) => {
    let {userName, lastName, userRoll} = req.session
    res.render('products', {name: userName, lastName: lastName, roll: userRoll})
})

viewsRouter.get('/logout', (req, res) => {
    req.session.destroy (err => {
        if(err) res.send('Problemas con el logout!!')
        res.redirect('/')
    })
})

module.exports = viewsRouter