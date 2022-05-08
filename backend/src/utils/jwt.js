const jwt = require('jsonwebtoken')

module.exports = {
	sign: (payload) => jwt.sign(payload, 'SECRET-KEY'),
	verify: (token) => jwt.verify(token, 'SECRET-KEY')
}