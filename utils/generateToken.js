const jwt = require("jsonwebtoken");
const UserToken = require("../models/UserToken");

const generateTokens = async (user)  =>{
  try {
    const payload = {id: user._id, email: user.email  }
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '15m'})
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH, {expiresIn: '30d'})
    const userToken = await UserToken.findOne({userId: user._id})
    if (userToken) await userToken.remove()

    await new UserToken({userId: user._id, token: refreshToken}).save()
    return Promise.resolve({accessToken, refreshToken})

  }catch(err) {
    return Promise.reject(err)
  }
}



module.exports = generateTokens;
