const mongoose = require('mongoose')
const URL = 'mongodb+srv://manager:CoderHouse92857@clustervirtus.0ez8je4.mongodb.net/ecommerce'

module.exports = {
    connect: async () => {
        return await mongoose.connect(URL, {})
            .then(connection => {
                console.log('Database connection Successful!!')
            })
            .catch(err => {
                console.log('Database connection failure ' + err)
            })
    }
}