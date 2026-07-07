import TokenManager from '../security/token-manager.js';
import response from '../utils/response.js';
import AuthenticationError from '../exceptions/authentication-error.js';
import AuthorizationError from '../exceptions/authorization-error.js';

export async function authenticateToken(req, res, next) {
  const token = req.headers.authorization;
  if (token && token.indexOf('Bearer ') !== -1) {
    try {
      const user = await TokenManager.verify(token.split('Bearer ')[1], process.env.ACCESS_TOKEN_KEY);
      req.user = user;
      return next();
    } catch (error) {
      return response(res, 401, error.message, null);
    }
  }

  return response(res, 401, 'Unauthorized', null);
};

export function checkRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Autentikasi diperlukan'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AuthorizationError(
        `Akses ditolak: hanya ${allowedRoles.join(', ')} yang dapat mengakses resource ini`
      ));
    }

    return next();
  };
}
