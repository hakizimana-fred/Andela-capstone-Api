const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = (req, res, next) => {
	const token = req.headers['authorization']
	if (token && token.startsWith('Bearer')) {
		token = token.split(' ')[1]
		try {
			const payload = jwt.verify(token, 'MYSECRET')
			req.user = payload.id

		}catch(err) {}
	}else {
		return res.status(401).json({message: "invalid token"})
	}
}

const authorize = async (req, res, next) => {
	try {
		const user = await User.findById(req.user)
		if (user && user.role === "admin") {
			return next()
		}
		return res.status(500).json({message: "Not authorize"})
	}catch(err){		
		return res.status(500).json({message: "Not authorize"})
	}
	
}

module.exports = {
	authorize, 
	authorize
}