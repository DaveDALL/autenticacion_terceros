const express = require('express')
const {Router} = express
const User = require('../dao/models/user.model')
const {passHashing, validatePass} = require('../utils/bcrypt')
const authRouter = new Router()

adminUser = {
    userName: 'administrator',
    userMail: 'adminCoder@coder.com',
    userPassword: 'adminCod3r123',
    userRoll: 'admin'
}

authRouter.post('/authRegistration', async (req, res) => {
    let {userName, lastName, userMail, userPassword} = req.body
    try {
        if(userName && lastName && userMail && userPassword) {
            let foundUser = await User.findOne({userMail: userMail})
            if(!foundUser) {
                let hashedPassword = passHashing(userPassword)
                await User.create({
                    userName,
                    lastName,
                    userMail,
                    userPassword: hashedPassword,
                    userRoll: 'usuario'
                })
                res.redirect('/')
            }else res.status(400).send('El usuario ya existe!!')
        }
    }catch(err) {
        console.log('No se pudo crear el usuario con mongoose ' + err)
    }
})

authRouter.post('/authLogin', async (req, res) => {
    let {userMail, userPassword} = req.body
    let foundUser = {}
    let isValidPass = false
    try {
        if(userMail === adminUser.userMail && userPassword === adminUser.userPassword) {
            foundUser = adminUser
            isValidPass = true
        }else {
            foundUser = await User.findOne({userMail: userMail})
            if(foundUser) {
                isValidPass = validatePass(userPassword, foundUser.userPassword)
                if(isValidPass) {
                    req.session.userMail = foundUser.userMail
                    req.session.userName = foundUser.userName
                    req.session.lastName = foundUser.lastName || ' '
                    req.session.userRoll = foundUser.userRoll
                    res.redirect('/products')
                } else res.redirect('/')  
            }else res.redirect('/userRegistration')
        }
    }catch(err) {
        console.log('No se pudo confirmar el usuario con mongoose ' + err)
    }
})

module.exports = authRouter
