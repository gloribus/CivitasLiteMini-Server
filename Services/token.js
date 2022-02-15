const jwt = require('jsonwebtoken');
const TokenModel = require('../Models').token;

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '1h'})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '7d'})
        return {
          accessToken,
          refreshToken
        }
    }

    validateAccessToken(token) {
        try {
            const tokenData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return tokenData;
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return userData;
        } catch (e) {
            return null;
        }
    }

    async saveToken(userID, refreshToken) {
      const tokenData = await TokenModel.findOne({where: { userID }});

      if (tokenData !== null) {
        tokenData.refreshToken = refreshToken
        return tokenData.save();
      }

      const token = await TokenModel.create({userID, refreshToken})
      return token;
    }

    async removeToken(refreshToken) {
        const tokenData = await TokenModel.destroy({where: { refreshToken }})
        return tokenData;
    }

    async findToken(refreshToken) {
        const tokenData = await TokenModel.findOne({where: { refreshToken }});
        return tokenData;
    }
}

module.exports = new TokenService();