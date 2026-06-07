import AuthRepositories from './authentications-repositories.js';
import UserRepositories from '../users/users-repositories.js';
import InvariantError from '../../exceptions/invariant-error.js';
import TokenManager from '../../security/token-manager.js';
import response from '../../utils/response.js';
import bcrypt from 'bcrypt';

const authRepositories = new AuthRepositories();
const userRepositories = new UserRepositories();

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

    const payload = TokenManager.verifyRefreshToken(refreshToken);
    const accessToken = TokenManager.generateAccessToken({
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role
    });

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
