import crypto from 'crypto';
import bcrypt from 'bcrypt';
import AuthRepositories from './authentications-repositories.js';
import UserRepositories from '../users/users-repositories.js';
import ExternalUsersRepositories from '../external-users/external-users-repositories.js';
import InvariantError from '../../exceptions/invariant-error.js';
import ClientError from '../../exceptions/client-error.js';
import TokenManager from '../../security/token-manager.js';
import { generateGoogleAuthUrl, getGoogleProfile } from '../../security/google-oauth.js';
import response from '../../utils/response.js';

const authRepositories = new AuthRepositories();
const userRepositories = new UserRepositories();
const externalUsersRepositories = new ExternalUsersRepositories();

/* ------------------------------------------------------------------ */
/* Login member (NPM + password)                                       */
/* ------------------------------------------------------------------ */

export const login = async (req, res, next) => {
  try {
    const { npm, password } = req.validated;

    const user = await userRepositories.verifyUser(npm);

    if (!user) {
      throw new InvariantError('NPM atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new InvariantError('NPM atau password salah');
    }

    const tokenPayload = {
      id: user.id,
      name: user.name,
      npm: user.npm,
      division: user.division,
      role: user.role,
    };

    const accessToken = TokenManager.generateAccessToken(tokenPayload);
    const refreshToken = TokenManager.generateRefreshToken(tokenPayload);

    await authRepositories.addRefreshToken(refreshToken);

    return response(res, 200, 'Login berhasil', { accessToken, refreshToken, user: { id: user.id, name: user.name, npm: user.npm, division: user.division, role: user.role } });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authRepositories.verifyRefreshToken(refreshToken);

    // Pakai ulang payload asli supaya npm/division/type tidak hilang.
    // iat & exp dibuang karena akan dibuat ulang oleh jwt.sign.
    // eslint-disable-next-line no-unused-vars
    const { iat, exp, ...payload } = TokenManager.verifyRefreshToken(refreshToken);

    // Token external hanya boleh diperbarui lewat endpoint external
    if (payload.type === 'external') {
      throw new InvariantError('Refresh token tidak valid');
    }

    const accessToken = TokenManager.generateAccessToken(payload);

    return res.status(200).json({
      status: 'success',
      message: 'Access token berhasil diperbarui',
      data: {
        accessToken,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    await authRepositories.verifyRefreshToken(refreshToken);
    await authRepositories.deleteRefreshToken(refreshToken);

    return res.status(200).json({
      status: 'success',
      message: 'Logout berhasil',
    });
  } catch (err) {
    return next(err);
  }
};

/* ------------------------------------------------------------------ */
/* Login Google (external users) - Authorization Code flow            */
/* ------------------------------------------------------------------ */

const isProd = process.env.NODE_ENV === 'production';

const STATE_COOKIE = 'oauth_state';
const REFRESH_COOKIE = 'external_refresh_token';
const REFRESH_COOKIE_PATH = '/auth/external'; // cookie hanya dikirim ke endpoint /auth/external/*

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // harus sama dengan REFRESH_TOKEN_TTL

// 'lax' cukup kalau frontend & API satu site (mis. app.domain.com + api.domain.com).
// Kalau beda site (mis. vercel.app + domain lain), set COOKIE_SAME_SITE=none (otomatis butuh secure).
const sameSite = process.env.COOKIE_SAME_SITE || 'lax';

const baseCookieOptions = {
  httpOnly: true,
  secure: isProd || sameSite === 'none',
  sameSite,
};

const frontendUrl = () => process.env.CLIENT_URL;

// GET /auth/google
export const googleRedirect = (req, res) => {
  const state = crypto.randomBytes(32).toString('hex');

  res.cookie(STATE_COOKIE, state, {
    ...baseCookieOptions,
    maxAge: 10 * 60 * 1000,
  });

  return res.redirect(generateGoogleAuthUrl(state));
};

// GET /auth/google/callback
export const googleCallback = async (req, res) => {
  const failRedirect = (reason) =>
    res.redirect(`${frontendUrl()}/login?error=${reason}`);

  try {
    const { code, state, error } = req.query;
    const savedState = req.cookies?.[STATE_COOKIE];

    res.clearCookie(STATE_COOKIE, baseCookieOptions);

    // User menekan "Batal" di halaman consent Google
    if (error) {
      return failRedirect('google_cancelled');
    }

    // Validasi CSRF
    if (!code || !state || !savedState || state !== savedState) {
      return failRedirect('invalid_state');
    }

    const profile = await getGoogleProfile(code);

    if (!profile.verified_email) {
      return failRedirect('email_not_verified');
    }

    const user = await externalUsersRepositories.upsertFromGoogle({
      googleId: profile.id,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture,
    });

    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      type: 'external',
    };

    const refreshTokenValue = TokenManager.generateRefreshToken(tokenPayload, {
      expiresIn: REFRESH_TOKEN_TTL,
    });
    await authRepositories.addRefreshToken(refreshTokenValue);

    res.cookie(REFRESH_COOKIE, refreshTokenValue, {
      ...baseCookieOptions,
      path: REFRESH_COOKIE_PATH,
      maxAge: REFRESH_COOKIE_MAX_AGE,
    });

    return res.redirect(`${frontendUrl()}/auth/callback`);
  } catch (err) {
    console.error('Google OAuth error:', err.message);
    return failRedirect(err instanceof ClientError ? 'account_conflict' : 'google_auth_failed');
  }
};

// POST /auth/external/refresh-token
// Dipanggil frontend setelah redirect (dan saat access token habis) untuk mendapat access token
export const externalRefreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) {
      throw new InvariantError('Sesi tidak ditemukan, silakan login ulang');
    }

    await authRepositories.verifyRefreshToken(token);

    // eslint-disable-next-line no-unused-vars
    const { iat, exp, ...payload } = TokenManager.verifyRefreshToken(token);
    if (payload.type !== 'external') {
      throw new InvariantError('Refresh token tidak valid');
    }

    const accessToken = TokenManager.generateAccessToken(payload, {
      expiresIn: ACCESS_TOKEN_TTL,
    });

    return response(res, 200, 'Access token berhasil diperbarui', {
      accessToken,
      user: { id: payload.id, name: payload.name, email: payload.email },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /auth/external/logout
export const externalLogout = async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];

    if (token) {
      await authRepositories.deleteRefreshToken(token).catch(() => { });
    }

    res.clearCookie(REFRESH_COOKIE, {
      ...baseCookieOptions,
      path: REFRESH_COOKIE_PATH,
    });

    return response(res, 200, 'Logout berhasil', null);
  } catch (error) {
    next(error);
  }
};
