import TokenManager from '../security/token-manager.js';
import response from '../utils/response.js';
import AuthenticationError from '../exceptions/authentication-error.js';
import AuthorizationError from '../exceptions/authorization-error.js';
import { hasPermission } from '../security/permission-cache.js';

const authenticate = (allowExternal) => async (req, res, next) => {
  const token = req.headers.authorization;
  if (token && token.indexOf('Bearer ') !== -1) {
    try {
      const user = await TokenManager.verify(token.split('Bearer ')[1], process.env.ACCESS_TOKEN_KEY);

      if (user.type === 'external' && !allowExternal) {
        return response(res, 403, 'Akses ditolak: resource ini hanya untuk anggota', null);
      }

      req.user = user;
      return next();
    } catch (error) {
      return response(res, 401, error.message, null);
    }
  }

  return response(res, 401, 'Unauthorized', null);
};

// Default: hanya member. Semua route yang sudah ada otomatis tertutup untuk external.
export const authenticateToken = authenticate(false);

// Untuk route yang boleh diakses member maupun external
export const authenticateAny = authenticate(true);

// Pasang SETELAH authenticateAny, untuk route yang hanya boleh dipakai external
export function onlyExternal(req, res, next) {
  if (req.user?.type !== 'external') {
    return next(new AuthorizationError('Hanya untuk pengguna eksternal'));
  }
  return next();
}

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

export function checkPermission(permission) {
  return async (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Autentikasi diperlukan'));
    }

    try {
      const allowed = await hasPermission(req.user.role, permission);

      if (!allowed) {
        return next(new AuthorizationError(
          `Akses ditolak: role Anda tidak memiliki izin '${permission}'`
        ));
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}