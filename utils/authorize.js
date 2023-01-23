const jwt = require('jsonwebtoken');
const User = require('../models/User');

// authenticate user token
const auth = (req, res, next) => {
    let token = req.headers['authorization'];
    if (token && token.startsWith('Bearer')) {
        token = token.split(' ')[1];
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            req.user = payload.id;
            next();
        } catch (err) {
            return res
                .status(401)
                .json({ status: false, message: 'Invalid token' });
        }
    } else {
        return res
            .status(401)
            .json({ status: false, message: 'No token was provided' });
    }
};

// authorize
const authorize = async (req, res, next) => {
    try {
        const user = await User.findById(req.user);
        if (user && user.role === 'admin') {
            return next();
        }
        return res.status(500).json({success: false, message: 'Not authorized user' });
    } catch (err) {
        return res.status(500).json({success: false,  message: 'Not authorized user' });
    }
};

module.exports = {
    auth,

    authorize,
};
