/* eslint-disable camelcase */
import { google } from 'googleapis';

export const createOAuth2Client = () =>
  new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

export const generateGoogleAuthUrl = (state) =>
  createOAuth2Client().generateAuthUrl({
    access_type: 'online',
    scope: ['openid', 'email', 'profile'],
    state,
    prompt: 'select_account',
  });

export const getGoogleProfile = async (code) => {
  const client = createOAuth2Client();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const { data } = await google.oauth2({ version: 'v2', auth: client }).userinfo.get();
  return data; // { id, email, verified_email, name, picture }
};
