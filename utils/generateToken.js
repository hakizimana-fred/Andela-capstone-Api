const jwt = require("jsonwebtoken");
const UserToken = require("../models/UserToken");

const generateTokens = async (user)  =>{
  try {
    const payload = {id: user._id, email: user.email, role: user.role }
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '7d'})
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH, {expiresIn: '30d'})
    // check if token is stored in the database
    const userToken = await UserToken.findOne({userId: user._id})
    // if user token is found in DB, invalidate it
    if (userToken) await userToken.remove()

    // create new token
    await new UserToken({userId: user._id, token: refreshToken}).save()
    return Promise.resolve({accessToken, refreshToken})

  }catch(err) {
    return Promise.reject(err);
  }
}



module.exports = generateTokens;
