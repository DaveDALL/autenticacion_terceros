const bcrypt = require('bcrypt')
let jumpings = 10
let createdSalts = bcrypt.genSaltSync(jumpings)

const passHashing = (password) => {
    return bcrypt.hashSync(password, createdSalts)
}

const validatePass = (userPass, hashedPass) => {
    return bcrypt.compareSync(userPass, hashedPass)
}

module.exports = {passHashing, validatePass}