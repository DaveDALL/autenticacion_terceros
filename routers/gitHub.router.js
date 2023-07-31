const express = require('express')
const {Router} = express
const passport = require('passport')

const gitRouter = new Router

gitRouter.get('/github', passport.authenticate('gitHubAuth', {scope: ['user:email'], session: false}))

gitRouter.get('/github/callback', passport.authenticate('gitHubAuth', {scope: ['user:email'], session:false, failureRedirect: '/'}),
async (req, res) => {
    let {userMail, userName, lastName, userRoll} = await req.user
    req.session.userMail = userMail
    req.session.userName = userName
    req.session.lastName = lastName || ' '
    req.session.userRoll = userRoll
    res.redirect('/products')
})

module.exports = gitRouter