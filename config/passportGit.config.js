const passport = require('passport')
const gitHubStrategy = require('passport-github2').Strategy
const User = require('../dao/models/user.model')

const initializePassportGit = () => {
    passport.use(
        'gitHubAuth',
        new gitHubStrategy(
            {
                clientID: 'fcaea0d6522b23ccfb58',
                clientSecret: 'aa34430276394c4511fcd9beb2edb13907084bc0',
                callbackURL: 'http://localhost:8080/auth/github/callback'
            }, async (accessToken, refreshToken, profile, done) => {
                if(profile._json.id) {
                    let foundUser = await User.findOne({userMail: profile._json.email})
                    if(!foundUser) {
                        let fullName = profile._json.name.split(' ')
                        let createdUser = await User.create({
                            userName: fullName[0],
                            lastName: fullName[1] || ' ',
                            userMail: profile._json.email,
                            userPassword: '',
                            userRoll: 'usuario'
                        })
                        done(null, createdUser)
                    } else done(null, foundUser)
                }}))}

module.exports = initializePassportGit




 