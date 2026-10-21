import jwt from 'jsonwebtoken';
import InvariantError from '../exceptions/invariant-error.js';

const TokenManager = {
  // options opsional (mis. { expiresIn: '15m' }). Tanpa options, perilakunya sama seperti sebelumnya.
  generateAccessToken: (payload, options = {}) =>
    jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, options),
  generateRefreshToken: (payload, options = {}) =>
    jwt.sign(payload, process.env.REFRESH_TOKEN_KEY, options),
  verifyRefreshToken: (refreshToken) => {
    try {
      const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
      return payload;
    } catch (error) {
      console.log(error);
      throw new InvariantError('Refresh token tidak valid');
    }
  },
  verify: (accessToken, secret) => {
    try {
      const payload = jwt.verify(accessToken, secret);
      return payload;
    } catch (error) {
      console.log(error);
      throw new InvariantError('Access token tidak valid');
    }
  }
};

export default TokenManager;