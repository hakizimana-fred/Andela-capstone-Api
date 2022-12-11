const jwt = require('jsonwebtoken')

function generateToken(user) {
    return jwt.sign({
        id: user._id,
        email: user.email
    }, 'MYSECRET', { expiresIn: '1hr'})
}

module.exports = generateToken